from django.contrib import admin
from .models import User, Game, Player


class UserAdmin(admin.ModelAdmin):
    list_display = [id, 'username']


class GameAdmin(admin.ModelAdmin):
    list_display = [id]


class PlayerAdmin(admin.ModelAdmin):
    list_display = ['game', 'user', 'is_white']


admin.site.register(Game, GameAdmin)
admin.site.register(Player, PlayerAdmin)
admin.site.register(User, UserAdmin)
