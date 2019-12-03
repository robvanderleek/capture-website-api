# Capture website API

![Night nurse](static/screenshot.png)

[![Build Status](https://travis-ci.com/robvanderleek/capture-website-api.svg?branch=master)](https://travis-ci.com/robvanderleek/capture-website-api)
[![BCH compliance](https://bettercodehub.com/edge/badge/robvanderleek/capture-website-api?branch=master)](https://bettercodehub.com/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)

Capture screenshots of websites as a (host it yourself) API. This project is a wrapper around this library: https://github.com/sindresorhus/capture-website

Try it yourself (*but beware that your screenshot is visible on a public website and the request may fail due to high traffic. Read further how prevent this*):
```
$ curl 'https://capture-website-api.herokuapp.com/capture?url=https://twitter.com' -o screenshot.png
```


# Installation

## Docker

Build the docker image and run it:

```
$ docker build -t cwa .
$ docker run -it -p 3000:3000 cwa
$ curl 'localhost:3000/capture?url=https://www.youtube.com' -o screenshot.png
```

## Yarn

```
$ yarn
$ yarn start
$ curl 'localhost:3000/capture?url=https://www.reddit.com' -o screenshot.png
```

## Heroku
