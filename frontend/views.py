import io
import math
import random
from django.contrib.auth.decorators import login_required
from django.contrib.humanize.templatetags.humanize import naturaltime
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Q

from .templatetags.new_game_form import NewGameForm
from game.models import Game, Player
from backend.models import User
import chess
import chess.pgn
import chess.svg


def index(request):
    return render(request, 'frontend/index.html', {
    })


def play(request, room_name=''):
    if not request.session.session_key:
        request.session.save()

    return render(request, 'frontend/index.html', {
        'room_name': room_name,
    })


def play_stockfish(request):
    if request.method == 'POST':
        fen = request.POST.get('starting_fen', '')
        playing_as = request.POST.get('playing_as', '')
        skill_level = request.POST.get('stockfish_level', '')
        thinking_time = request.POST.get('stockfish_thinking_time', '')
        print(fen,
              playing_as,
              skill_level,
              thinking_time)
        return render(request, 'frontend/index.html', {
            'fen': fen,
            'playing_as': playing_as,
            'skill_level': skill_level,
            'thinking_time': thinking_time
        })
    else:
        return HttpResponseRedirect(reverse('index'))


def editor(request):
    post_fen = ''
    if request.method == 'POST':
        post_fen = request.POST.get('starting_fen', '')
    return render(request, 'frontend/index.html', {
        'post_fen': post_fen,
    })


def analysis(request, fen=None):
    post_fen = ''
    post_pgn = ''
    if request.method == 'POST':
        post_fen = request.POST.get('fen', '')
        post_pgn = request.POST.get('pgn', '')[request.POST.get('pgn', '').find('1. '):]
        print(post_pgn)
    return render(request, 'frontend/index.html', {
        'post_fen': post_fen,
        'post_pgn': post_pgn,
    })


def create(request):
    if request.method == "POST":
        form = NewGameForm(request.POST)
        if form.is_valid():
            try:
                if not request.session.session_key:
                    request.session.save()

                white_player = form.cleaned_data['white_player']
                if white_player == 'random':
                    random_number = random.randint(0, 1)
                    white_player = 'initiator' if random_number else 'opponent'
                ids = [game.id for game in Game.objects.all()]
                game_id = get_random_str(length=6)
                while game_id in ids:
                    game_id = get_random_str(length=6)

                starting_fen = form.cleaned_data['starting_fen']
                if not chess.Board(starting_fen).is_valid():
                    raise ValueError('Invalid FEN.')
                game_options = {
                    'id': game_id,
                    'starting_fen': starting_fen,
                    'PGN': '.',
                    'time': form.cleaned_data['time'] * 60,
                }
                game = Game(**game_options)
                if form.cleaned_data['starting_fen'].split(' ')[1] == 'w':
                    player_to_play = white_player
                else:
                    player_to_play = 'opponent' if white_player == 'initiator' else 'initiator'

                opponent_player_fields = {
                    'game': game,
                    'is_white': white_player == 'opponent',
                    'to_play': player_to_play == 'opponent'
                }
                if form.cleaned_data['opponent']:
                    opponent_player_fields['user'] = User.objects.get(username=form.cleaned_data['opponent'].lower())
                else:
                    if not User.objects.filter(username='Anonymous').exists():
                        User(username='Anonymous').save()
                    opponent_player_fields['user'] = User.objects.get(username='Anonymous')

                opponent = Player(**opponent_player_fields)

                initiator_player_fields = {
                    'game': game,
                    'is_white': white_player == 'initiator',
                    'to_play': player_to_play == 'initiator'
                }
                if request.user.is_authenticated:
                    initiator_player_fields['user'] = User.objects.get(username=request.user)
                else:
                    if not User.objects.filter(username='Anonymous').exists():
                        User(username='Anonymous').save()
                    initiator_player_fields['user'] = User.objects.get(username='Anonymous')
                    initiator_player_fields['session_key'] = request.session.session_key
                initiator = Player(**initiator_player_fields)

                game.save()
                opponent.save()
                initiator.save()

                return HttpResponseRedirect(reverse('play', args=[game.id]))

            except ValueError as error:
                print(error)
                return HttpResponseRedirect(reverse('index'))

            except User.DoesNotExist:
                print("User does not exist.")
                return HttpResponseRedirect(reverse('index'))

    elif request.method == 'GET':
        return HttpResponseRedirect(reverse('index'))


@login_required(login_url='/login')
def games(request, filter_option):
    page = int(request.GET.get('page', 0))
    user = User.objects.get(username=request.user)
    player_instances = user.player_instaces.all()
    players = [player for player in player_instances if fullfils_filter(player, filter_option)]
    games_with_svg = get_games_svg(players)
    games_per_load = 12
    print(page * games_per_load, (page + 1) * games_per_load)
    return render(request, 'frontend/games.html', context={
        'games': games_with_svg[page * games_per_load:(page + 1) * games_per_load],
        'filter_option': filter_option,
        'asd': len(games_with_svg),
        'total_games': len(player_instances),
        'total_wins': len([player for player in player_instances if f'{"white" if player.is_white else "black"} wins' in player.game.end_type.lower()]),
        'total_losses': len([player for player in player_instances if f'{"black" if player.is_white else "white"} wins' in player.game.end_type.lower()]),
        'total_draws': len([player for player in player_instances if 'draw' in player.game.end_type.lower()]),
        'total_bookmarks': len([player for player in player_instances if player.bookmark]),
    })


def fullfils_filter(player, filter_option):
    game = player.game
    lowercase_end_type = game.end_type.lower()
    player_color = 'white' if player.is_white else 'black'
    opponent_color = 'black' if player.is_white else 'white'

    return filter_option == 'all' or \
           (filter_option == 'wins' and f'{player_color} wins' in lowercase_end_type) or \
           (filter_option == 'losses' and f'{opponent_color} wins' in lowercase_end_type) or \
           (filter_option == 'draws' and 'draw' in lowercase_end_type) or \
           (filter_option == 'bookmarks' and player.bookmark)


@login_required(login_url='/login')
def bookmark(request, game_id):
    player = Player.objects.get(Q(user__username=request.user) & Q(game__id=game_id))
    player.bookmark = not player.bookmark
    player.save()
    return HttpResponse()


def get_games_svg(players):
    games_with_svg = []

    for player in players:
        game = player.game
        pgn = io.StringIO(game.PGN)
        chess_game = chess.pgn.read_game(pgn)
        board = chess_game.board()
        for move in chess_game.mainline_moves():
            board.push(move)
        creation_time = str(naturaltime(game.created_at))
        creation_time = creation_time if ',' not in creation_time else creation_time.split(',')[0] + ' ago'

        games_with_svg.append({
            'game': game,
            'svg': chess.svg.board(board,
                                   colors={'square light': '#F0D9B5', 'square dark': '#B58863'},
                                   flipped=not player.is_white,
                                   coordinates=False,
                                   lastmove=board.move_stack[-1] if len(board.move_stack) > 0 else None),
            'white_player': game.players.get(is_white=True).user.username,
            'black_player': game.players.get(is_white=False).user.username,
            'outcome': game.end_type if game.end_type else 'Playing right now.',
            'creation_time': creation_time,
        })
    games_with_svg.sort(key=lambda game_with_svg: game_with_svg['game'].created_at, reverse=True)

    return games_with_svg


def get_random_str(length):
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    numbers = '0123456789'
    possible = letters + numbers
    string = letters[math.floor(random.random() * len(letters))]
    for i in range(0, length):
        string += possible[math.floor(random.random() * len(possible))]

    return string
