def switch_mode():
    replace('drj_chess/settings.py',
            [("SECRET_KEY = os.getenv('SECRET_KEY')",
              "SECRET_KEY = 'django-insecure-+szapcy%zina7dwjza_vaepc7822uzl+wi1n1npt$f)7b!o&z7'"),
             ("['https://drj-chess.herokuapp.com']",
              "['http://192.168.0.30:8000']"),
             ("'hosts': [os.environ.get('REDIS_URL')]",
              "'hosts': [('http://192.168.0.30:8000', 6379)]"),
             ("DEBUG = True",
              "DEBUG = False")])

    replace('frontend/static/js/hooks/useWebsocket.js',
            [('wss://',
              'ws://')])

    replace('frontend/webpack.config.js',
            [("'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)",
              "'process.env': {NODE_ENV: JSON.stringify('development')}")])


def replace(file, to_replace):
    with open(file, 'r') as raw_file:
        content = raw_file.read()
        for production, development in to_replace:
            if production in content:
                content = content.replace(production,
                                          development)
            else:
                content = content.replace(development,
                                          production)
    raw_file.close()

    with open(file, 'w') as raw_file_w:
        raw_file_w.write(content)
    raw_file_w.close()


if __name__ == '__main__':
    switch_mode()
