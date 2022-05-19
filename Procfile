web: daphne -p 8001 chess.asgi:application --port $PORT --bind 0.0.0.0 -v2
worker: celery -A chess worker -l INFO
beat: celery -A chess beat -l INFO