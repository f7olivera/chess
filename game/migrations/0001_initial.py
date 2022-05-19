# Generated by Django 4.0.4 on 2022-05-19 02:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('starting_fen', models.CharField(max_length=90)),
                ('start_ts', models.FloatField(blank=True, null=True)),
                ('end_ts', models.FloatField(blank=True, null=True)),
                ('last_move_ts', models.FloatField(blank=True, default=0)),
                ('started', models.BooleanField(blank=True, default=False)),
                ('PGN', models.TextField(default='.')),
                ('time', models.PositiveIntegerField()),
                ('end_type', models.CharField(blank=True, default='', max_length=64, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_key', models.CharField(blank=True, default='', max_length=64, null=True)),
                ('connected', models.BooleanField(blank=True, default=False, null=True)),
                ('is_white', models.BooleanField()),
                ('to_play', models.BooleanField()),
                ('spent_time', models.FloatField(blank=True, default=0, null=True)),
                ('offered_draw', models.BooleanField(blank=True, default=False, null=True)),
                ('bookmark', models.BooleanField(blank=True, default=False, null=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='players', to='game.game')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player_instaces', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=64)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('session_key', models.CharField(blank=True, default='', max_length=64, null=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat', to='game.game')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
