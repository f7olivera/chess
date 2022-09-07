import collections
import io
import json
import random
import time

from channels.exceptions import StopConsumer
from django.contrib.humanize.templatetags.humanize import naturaltime
import datetime

import chess
import chess.pgn
from asgiref.sync import async_to_sync
from .models import User, Game, Player, ChatMessage
from django.db.models import Q

from channels.generic.websocket import WebsocketConsumer


class ChessGame(WebsocketConsumer):

    def connect(self):
        game, players, current_player, opponent_player, white_player, black_player = self.get_data()
        self.room_group_name = 'chess_game_%s' % game.id

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.spectator = False

        if current_player == 'spectator':
            self.spectator = True
            self.accept()
            self.board = chess.Board(game.starting_fen)
            game_data = self.get_game_data()
            self.send(json.dumps({
                'action': 'spectate',
                **game_data,
            }))
        elif current_player.user.username != 'Anonymous' or current_player.session_key == self.scope['session'].session_key:
            current_player.connected = True
            current_player.save()
            self.accept()
            self.board = chess.Board(game.starting_fen)
            self.check_time()

            if game.PGN:
                pgn = io.StringIO(str(game.PGN))
                chess_game = chess.pgn.read_game(pgn)
                for move in chess_game.mainline_moves():
                    self.board.push(move)

            game_data = self.get_game_data()
            self.send(json.dumps({
                'action': 'connect',
                **game_data,
                'wait': opponent_player.user.username == 'Anonymous' and opponent_player.session_key == '',
                'draw_offer': opponent_player.offered_draw,
                'bookmark': current_player.bookmark,
                'playing_as': 'w' if current_player == white_player else 'b',
            }))
            self.check_connections()
        else:
            if self.scope['user'].is_anonymous:
                current_player.session_key = self.scope['session'].session_key
            else:
                current_player.user = User.objects.get(username=self.scope['user'])
            current_player.connected = True
            current_player.save()
            self.accept()
            self.board = chess.Board(game.starting_fen)

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {
                    'type': 'stop_waiting',
                    'sender_channel_name': self.channel_name,
                    'white_player': str(white_player.user.username),
                    'black_player': str(black_player.user.username),
                }
            )

            game_data = self.get_game_data()
            self.send(json.dumps({
                'action': 'connect',
                **game_data,
                'draw_offer': opponent_player.offered_draw,
                'bookmark': current_player.bookmark,
                'playing_as': 'w' if current_player == white_player else 'b',
            }))

            self.check_connections()

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        e = 'no error'

        try:
            game, players, current_player, opponent_player, white_player, black_player = self.get_data()
            self.check_time()
            if 'chat_message' in text_data_json:
                chat_message = ChatMessage(game=game,
                                           message=text_data_json['chat_message']['message'],
                                           sender=User.objects.get(username=text_data_json['chat_message']['sender']),
                                           session_key=self.scope['session'].session_key)
                chat_message.save()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name, {
                        'type': 'chat_message',
                        'sender_channel_name': self.channel_name,
                        'chat_message_id': chat_message.id,
                    }
                )
            elif self.spectator:
                pass
            elif 'timeout' in text_data_json:
                self.check_time()
            elif 'offer_draw' in text_data_json and not players.filter(offered_draw=True):
                current_player.offered_draw = True
                current_player.save()

                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'offer_draw',
                        'sender_channel_name': self.channel_name,
                        'draw_offer': True,
                    }
                )
            elif opponent_player.offered_draw and ('accept_draw' in text_data_json or 'refuse_draw' in text_data_json):
                if 'accept_draw' in text_data_json:
                    self.end_game('Draw.')
                else:
                    opponent_player.offered_draw = False
                    opponent_player.save()
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name,
                        {
                            'type': 'offer_draw',
                            'sender_channel_name': '',
                            'draw_offer': False,
                        }
                    )
            elif 'resign' in text_data_json:
                end_type = ('White' if current_player.is_white else 'Black') \
                           + ' resigned. ' \
                           + ('Black' if current_player.is_white else 'White') \
                           + ' wins.'
                self.end_game(end_type)
            elif not game.started and players.filter(connected=False):
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name, {
                        'type': 'undo_last_move',
                        'sender_channel_name': self.channel_name,
                    }
                )
            elif not game.end_type:
                move = self.board.parse_san(text_data_json['move'])
                self.board.push(move)

                if not game.started and not players.filter(connected=False):
                    game.started = True
                    game.start_ts = float(text_data_json['start_ts'])
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name, {
                            'type': 'start',
                            'start_ts': str(game.start_ts)
                        }
                    )
                else:
                    current_player.spent_time += time.time() - (game.last_move_ts / 1000)

                current_player.to_play = False
                current_player.save()

                opponent_player.to_play = True
                opponent_player.save()

                game.last_move_ts = float(text_data_json['start_ts'])
                game.PGN = chess.pgn.Game.from_board(self.board)
                game.save()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'move',
                        'move': str(text_data_json['move']),
                        'uci': str(move.uci()),
                        'board': str(self.board),
                        'sender_channel_name': self.channel_name
                    }
                )
        except ValueError as error:
            e = error

        self.send(json.dumps({
            'error': str(e),
        }))

    def disconnect(self, code):
        if not self.spectator:
            game, players, current_player, opponent_player, white_player, black_player = self.get_data()
            game.PGN = chess.pgn.Game.from_board(self.board)
            game.save()

            current_player.connected = False
            current_player.save()

            self.check_connections()

        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        raise StopConsumer()
        # return super().disconnect(code)

    def move(self, event):
        if self.channel_name != event['sender_channel_name']:
            self.board.push_san(event['move'])
            game, players, current_player, opponent_player, white_player, black_player = self.get_data()
            white_time, black_time = self.get_players_time()

            # Send move to WebSocket
            self.send(json.dumps({
                'action': 'move',
                'move': str(event['move']),
                'uci': str(event['uci']),
                'board': str(self.board),
                'white_time': white_time,
                'black_time': black_time,
                'pgn': game.PGN,
            }))

    def undo_last_move(self, event):
        if self.channel_name == event['sender_channel_name']:
            self.send(json.dumps({
                'action': 'undo',
            }))

    def start(self, event):
        self.send(json.dumps({
            'action': 'start',
            'start_ts': str(event['start_ts']),
        }))

    def offer_draw(self, event):
        if self.channel_name != event['sender_channel_name']:
            # Send move to WebSocket
            self.send(json.dumps({
                'action': 'draw_offer',
                'draw_offer': event['draw_offer'],
            }))

    def end(self, event):
        self.send(json.dumps({
            'action': 'end',
            'end_type': event['end_type'],
        }))

    def end_game(self, end_type):
        if not self.spectator:
            game, players, current_player, opponent_player, white_player, black_player = self.get_data()
            player_to_move = current_player if current_player.is_white == self.board.turn else opponent_player
            player_to_move.spent_time += time.time() - (game.last_move_ts / 1000)
            player_to_move.save()
            game.end_type = end_type
            game.end_ts = time.time()
            game.save()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                'type': 'end',
                'end_type': end_type
            }
        )

    def wait_before_start(self, event):
        self.send(json.dumps({
            'action': 'wait_before_start',
            'waiting_for': event['waiting_for']
        }))

    def stop_waiting(self, event):
        if self.channel_name != event['sender_channel_name']:
            self.send(json.dumps({
                'action': 'stop_waiting',
                'white_player': event['white_player'],
                'black_player': event['black_player'],
            }))

    def chat_message(self, event):

        if self.channel_name != event['sender_channel_name']:
            game, players, current_player, opponent_player, white_player, black_player = self.get_data()
            chat_message = ChatMessage.objects.get(id=event['chat_message_id'])

            parsed_chat = {'message': chat_message.message,
                           'sender': chat_message.sender.username if chat_message.sender.username != 'Anonymous' else
                            (('[white]' if players.get(session_key=chat_message.session_key).is_white else '[black]')
                             if players.filter(session_key=chat_message.session_key).exists() else 'Anonymous'),
                           'date': str(chat_message.date)}

            self.send(json.dumps({
                'action': 'chat_message',
                'chat_message': parsed_chat,
            }))

    def get_players_time(self):
        game, players, current_player, opponent_player, white_player, black_player = self.get_data()
        white_time_offset = 0
        if white_player.to_play and game.started and not game.end_type:
            white_time_offset = time.time() - game.last_move_ts / 1000
        black_time_offset = 0
        if black_player.to_play and game.started and not game.end_type:
            black_time_offset = time.time() - game.last_move_ts / 1000
        white_time = game.time - white_player.spent_time - white_time_offset
        black_time = game.time - black_player.spent_time - black_time_offset
        return [white_time, black_time]

    def check_connections(self):
        game, players, current_player, opponent_player, white_player, black_player = self.get_data()

        if not game.started and not game.end_type:
            if players.filter(connected=False):
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name, {
                        'type': 'wait_before_start',
                        'waiting_for': 'opponent'
                    }
                )
            else:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name, {
                        'type': 'stop_waiting',
                        'sender_channel_name': self.channel_name,
                        'white_player': str(white_player.user.username),
                        'black_player': str(black_player.user.username),
                    }
                )

    def check_time(self):
        game, players, current_player, opponent_player, white_player, black_player = self.get_data()
        white_time, black_time = self.get_players_time()

        end_type = ''
        if white_time <= 0 and black_time <= 0:
            end_type = 'White time out. Black wins.' if white_time < black_time else 'Black time out. White wins.'
        elif black_time <= 0:
            end_type = 'Black time out. White wins.'
        elif white_time <= 0:
            end_type = 'White time out. Black wins'

        if end_type and not game.end_type:
            self.end_game(end_type)

    def get_data(self):
        game_id = self.scope['url_route']['kwargs']['room_name']
        game = Game.objects.get(id=game_id)
        players = Player.objects.filter(game_id=game_id)

        if self.scope['user'].is_anonymous:
            current_player = players.filter(session_key=self.scope['session'].session_key).first()
        else:
            current_player = players.filter(user__username=self.scope['user']).first()
        if not current_player:
            if players.filter(Q(user__username='Anonymous') & Q(session_key='')).exists():
                current_player = players.get(Q(user__username='Anonymous') & Q(session_key=''))
            else:
                current_player = 'spectator'

        opponent_player = players.get(~Q(id=current_player.id)) if current_player != 'spectator' else ''
        white_player = players.get(is_white=True)
        black_player = players.get(is_white=False)

        return [game, players, current_player, opponent_player, white_player, black_player]

    def get_game_data(self):
        game, players, current_player, opponent_player, white_player, black_player = self.get_data()
        creation_time = str(naturaltime(game.created_at))
        creation_time = creation_time if ',' not in creation_time else creation_time.split(',')[0] + ' ago'
        chat = game.chat.all()
        parsed_chat = [{'message': message.message,
                        'sender': message.sender.username if message.sender.username != 'Anonymous' else
                        (('[white]' if players.get(session_key=message.session_key).is_white else '[black]') if players.filter(session_key=message.session_key).exists() else 'Anonymous'),
                        'date': str(message.date),
                        'me': self.scope['user'].username == message.sender.username or self.scope['session'].session_key == message.session_key} for message in chat]
        white_time, black_time = self.get_players_time()
        return {
            'white_player': str(white_player.user.username),
            'black_player': str(black_player.user.username),
            'time': str(game.time),
            'created_time': creation_time,
            'outcome': str(self.board.outcome()),
            'started': int(game.started),
            'starting_fen': self.board.fen(),
            'pgn': str(game.PGN),
            'white_time': white_time,
            'black_time': black_time,
            'end_type': game.end_type,
            'chat': parsed_chat,
        }
