from django.db import models
from backend.models import User


class Game(models.Model):
    id = models.CharField(primary_key=True, max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    starting_fen = models.CharField(max_length=90)
    start_ts = models.FloatField(blank=True, null=True)
    end_ts = models.FloatField(blank=True, null=True)
    last_move_ts = models.FloatField(default=0, blank=True)
    started = models.BooleanField(default=False, blank=True)
    PGN = models.TextField(default='.')
    time = models.PositiveIntegerField()
    end_type = models.CharField(default='', blank=True, null=True, max_length=64)


class Player(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="players")
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE, related_name="player_instaces")
    session_key = models.CharField(default='', blank=True, null=True, max_length=64)
    connected = models.BooleanField(default=False, blank=True, null=True)
    is_white = models.BooleanField()
    to_play = models.BooleanField()
    spent_time = models.FloatField(default=0, blank=True, null=True)
    offered_draw = models.BooleanField(default=False, blank=True, null=True)
    bookmark = models.BooleanField(default=False, blank=True, null=True)

    def __str__(self):
        return (self.user.username if self.user is not None else 'Anonymous') + (' (white)' if self.is_white else ' (black)')

    def save(self, *args, **kwargs):
        super(Player, self).save(*args, **kwargs)


class ChatMessage(models.Model):
    message = models.CharField(max_length=64)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="chat")
    date = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    session_key = models.CharField(default='', blank=True, null=True, max_length=64)

    def __str__(self):
        return '[' + str(self.date) + ']' + self.sender.username + ': ' + self.message
