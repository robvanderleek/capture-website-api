#!/bin/sh
wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh
heroku container:login
heroku container:push web --app $1
heroku container:release web --app $1
