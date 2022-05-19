web: daphne -p 8001 drj_chess.asgi:application --port $PORT --bind 0.0.0.0 -v2
worker: celery -A drj_chess worker -l INFO
beat: celery -A drj_chess beat -l INFO