# Capture website API

![Night nurse](static/screenshot.png)

[![Build Status](https://travis-ci.com/robvanderleek/capture-website-api.svg?branch=master)](https://travis-ci.com/robvanderleek/capture-website-api)
[![BCH compliance](https://bettercodehub.com/edge/badge/robvanderleek/capture-website-api?branch=master)](https://bettercodehub.com/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![DockerHub image pulls](https://img.shields.io/docker/pulls/robvanderleek/capture-website-api)](https://hub.docker.com/repository/docker/robvanderleek/capture-website-api)

Capture screenshots of websites as a (host it yourself) API. This project is a wrapper around this library: https://github.com/sindresorhus/capture-website

Try it yourself (*but beware that your screenshot is visible on a public website and the request may fail due to high traffic. Read further how prevent this*):
```
$ curl 'https://capture-website-api.herokuapp.com/capture?url=https://twitter.com' -o screenshot.png
```


# Installation

## Docker

Run pre-built container from Docker Hub:
```
$ docker pull robvanderleek/capture-website-api
$ docker run -it -p 3000:3000 robvanderleek/capture-website-api
$ curl 'localhost:3000/capture?url=https://news.ycombinator.com/' -o screenshot.png
``` 

Build the docker image and run it:
```
$ git clone git@github.com:robvanderleek/capture-website-api.git
$ cd capture-website-api
$ docker build -t cwa .
$ docker run -it -p 3000:3000 cwa
$ curl 'localhost:3000/capture?url=https://www.youtube.com' -o screenshot.png
```

## Yarn

Run in a terminal:
```
$ git clone git@github.com:robvanderleek/capture-website-api.git
$ cd capture-website-api
$ yarn
$ yarn start
$ curl 'localhost:3000/capture?url=https://www.reddit.com' -o screenshot.png
```

## Heroku

Deploy and run on Heroku
```
$ git clone git@github.com:robvanderleek/capture-website-api.git
$ cd capture-website-api
$ heroku container:login
$ heroku create
$ heroku container:push web
$ heroku container:release web
$ heroku container:release web
$ CWA_URL=$(heroku info -s | grep web_url | cut -d= -f2)
$ curl "${CWA_URL}capture?url=https://www.linkedin.com" -o screenshot.png
```

# Usage

Call the `/capture` endpoint and pass the site URL using the query parameters `url`:
```
$ curl 'https://capture-website-api.herokuapp.com/capture?url=http://gmail.com' -o screenshot.png
```
Simple as that.

Most of the configuration options from the wrapped `capture-website` library are supported using query parameters. 
For example, to capture a site with a 650x350 viewport, no default background and animations disabled use:
```
curl 'https://capture-website-api.herokuapp.com/capture?url=http://amazon.com&width=650&height=350&scaleFactor=1&defaultBackground=false&disableAnimations=true' -o screenshot.png
```

See https://github.com/sindresorhus/capture-website for a full list of options.

# Configuration

This API looks two environment variables:

* `SHOW_RESULTS`: if `true` the latest capture result can be viewed in the browser by browsing the base url (e.g.: https://capture-website-api.herokuapp.com/)  
* `SECRET`: when set all capture requests need to contain a query parameter `secret` whose value matches the value of this environment variable

# Contributing

If you have suggestions for improvements, or want to report a bug, [open an issue](https://github.com/robvanderleek/capture-website-api/issues)!

# License

[ISC](LICENSE) © 2019 Rob van der Leek <robvanderleek@gmail.com> (https://twitter.com/robvanderleek)
