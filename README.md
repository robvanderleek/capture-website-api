# Capture website API

<div align="center">

[![Logo](static/logo_256x256.png)](https://www.freepik.com/icon/capture_6276243)

</div>

<div align="center">

![Screenshot](static/screenshot.png)

</div>

<div align="center">

[![Build Status](https://github.com/robvanderleek/capture-website-api/workflows/CICD/badge.svg)](https://github.com/robvanderleek/capture-website-api/actions)
[![CodeLimit](https://github.com/robvanderleek/capture-website-api/blob/_codelimit_reports/add-codelimit/badge.svg)](https://github.com/robvanderleek/capture-website-api/blob/_codelimit_reports/add-codelimit/codelimit.md)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![DockerHub image pulls](https://img.shields.io/docker/pulls/robvanderleek/capture-website-api)](https://hub.docker.com/repository/docker/robvanderleek/capture-website-api)
![Vercel](https://vercelbadge.vercel.app/api/robvanderleek/capture-website-api)

</div>

Capture screenshots of websites as a (host it yourself) API. This project is a
wrapper around this library: https://github.com/sindresorhus/capture-website

# Installation

## Docker

### Run pre-built container from Docker Hub

1. Pull the image:
```
docker pull robvanderleek/capture-website-api
```

2. Start the container:
```
docker run -it -p 8080:8080 robvanderleek/capture-website-api
```

3. Make screenshot test request:
```
curl 'localhost:8080/capture?url=https://news.ycombinator.com/' -o screenshot.png
``` 

### Build the docker image and run it

1. Clone the repo:
```shell
git clone git@github.com:robvanderleek/capture-website-api.git
```

2. Go to the `standalone` directory:
```shell
cd capture-website-api/standalone
```

3. Build the image:
```shell
docker build -t cwa .
```

4. Start the container: 
```shell
docker run -it -p 8080:8080 cwa
```

5. Do screenshot test request:
```shell
curl 'localhost:8080/capture?url=https://www.youtube.com' -o screenshot.png
```

## Yarn

Run in a terminal:

1. Clone the repo:
```shell
git clone git@github.com:robvanderleek/capture-website-api.git
```

2. Go to the `standalone` directory:
```shell
cd capture-website-api/standalone
```

3. Install dependencies:
```shell
yarn
```

4. Start the server:
```shell
yarn start
```

5. Do screenshot test request:
```shell
curl 'localhost:8080/capture?url=https://www.reddit.com' -o screenshot.png
```

## Vercel

Deploy and run on Vercel:

1. Clone the repo:
```
git clone git@github.com:robvanderleek/capture-website-api.git && cd capture-website-api/serverless
```

2. Deploy to Vercel:
```shell
vercel deploy
```

3. Get site URL:
```shell
vercel ls 
```

7. Make screenshot test request:
```
curl "${SITE_URL}/api/capture?url=https://www.linkedin.com" -o screenshot.png
```

# Usage

Call the `/capture` endpoint and pass the site URL using the query parameters `url`:
```shell
curl 'https://capture-website-api.vercel.app/api/capture?url=http://gmail.com' -o screenshot.png
```
Simple as that.

# Configuration

## Application options

Application configuration options can be set as environment veriables or in 
a `.env` file in the root folder. There's an example `.env` file in the codebase: [`.env.example`](https://github.com/robvanderleek/capture-website-api/blob/main/.env.example)

Supported options are:

| Name | Descrition | Default |
|---|---|---|
| TIMEOUT | Timeout in seconds for loading a web page | 20 |
| CONCURRENCY | Number of captures that run in parallel, more memory allows more captures to run in parallel | 2 |
| MAX_QUEUE_LENGTH | Requests that can't be handled directly are queued until the queue is full | 6 |
| SHOW_RESULTS | Enable web endpoint to show latest capture | false |
| SECRET | Secret string to prevent undesired usage on public endpoints | "" |

## Capturing options

Most of the configuration options from the wrapped `capture-website` library are supported using query parameters. 
For example, to capture a site with a 650x350 viewport, no default background and animations disabled use:
```
curl 'https://capture-website-api.vercel.app/api/capture?url=http://amazon.com&width=650&height=350&scaleFactor=1&defaultBackground=false&disableAnimations=true&wait_before_screenshot_ms=300' -o screenshot.png
```

See https://github.com/sindresorhus/capture-website for a full list of options.

### Capture Delay

You may require to wait for async requests or animations to finish before capturing the screenshot. There are two ways of doing this, both specified in the query parameters:

1. `wait_before_screenshot_ms` (in ms, defaults to `300`) will wait before capturing a screenshot.
2. For standalone: `capture-website` library's [`delay`](https://github.com/sindresorhus/capture-website#delay) (in seconds)

## Use plain Puppeteer 

Sometimes the `capture-website` library has problems capturing sites. You can try to
capture these sites with plain Puppeteer by supplying the query parameter `plainPuppeteer=true`

## Environment variables

This app looks at two environment variables:

* `SHOW_RESULTS`: if `true` the latest capture result can be viewed in the browser by browsing the base url  
* `SECRET`: when set all capture requests need to contain a query parameter `secret` whose value matches the value of this environment variable

# Contributing

If you have suggestions for improvements, or want to report a bug, [open an issue](https://github.com/robvanderleek/capture-website-api/issues)!

# License

[ISC](LICENSE) © 2019 Rob van der Leek <robvanderleek@gmail.com> (https://twitter.com/robvanderleek)
