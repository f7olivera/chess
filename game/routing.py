from django.urls import re_path
from .consumers import ChessGame

ws_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$', ChessGame.as_asgi(), name='ws_game')
]
