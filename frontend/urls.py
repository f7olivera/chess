from django.urls import path
from . import views
import backend.views

urlpatterns = [
    path('', views.index, name='index'),
    path('play/stockfish/', views.play_stockfish, name='play_stockfish'),
    path('play/offline/', views.play, name='play_offline'),
    path('play/<str:room_name>/', views.play, name='play'),
    path('create', views.create, name='create'),
    path('editor', views.editor, name='editor'),
    path('analysis', views.analysis, name='analysis'),
    path('analysis/<path:fen>', views.analysis, name='analysis'),
    path('analysis/', views.analysis, name='analysis'),
    path('games/<str:filter_option>', views.games, name='games'),
    path('bookmark/<str:game_id>', views.bookmark, name='bookmark'),
    path("login", backend.views.login_view, name="login"),
    path("logout", backend.views.logout_view, name="logout"),
    path("register", backend.views.register, name="register"),
    path("backend/user/<str:username>", backend.views.check_user_existence, name="check_user_existence"),
    path("backend/email/<str:email>", backend.views.check_email_existence, name="check_email_existence"),
]
