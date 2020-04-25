const captureWebsite = require('capture-website');
const puppeteer = require('puppeteer');

const DEFAULT_TIMEOUT_SECONDS = 10;

const latest = {
    capture: undefined,
    url: undefined,
    date: undefined
};

function showResults() {
    const showResults = process.env.SHOW_RESULTS;
    return showResults && showResults === 'true';
}

async function takePlainPuppeteerScreenshot(url, options) {
    options.encoding = 'binary';
    const browser = await puppeteer.launch(options.launchOptions);
    const page = await browser.newPage();
    await page.goto(url);
    await new Promise(r => setTimeout(r, 3000));
    await setViewport(page, options);
    const buffer = await page.screenshot();
    await browser.close();
    return buffer;
}

async function setViewport(page, options) {
    if (options.width && options.height) {
        const viewportOptions = {
            width: options.width,
            height: options.height,
            deviceScaleFactor: options.scaleFactor ? options.scaleFactor : 1
        };
        await page.setViewport(viewportOptions);
    }
}

function validRequest(req) {
    const secret = process.env.SECRET;
    if (!secret) {
        return true;
    }
    if (!req.query || !req.query.secret) {
        return false;
    }
    return req.query.secret === secret;
}

async function capture(req, res) {
    if (!validRequest(req)) {
        res.status(403).send('Go away please');
        return;
    }
    latest.date = new Date();
    const queryParams = req.query;
    const url = queryParams.url;
    latest.url = url;
    console.log('Capturing URL: ' + url + ' ...');
    queryParams.launchOptions = {
        // headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--hide-scrollbars',
            '--mute-audio',
            '--use-fake-ui-for-media-stream' // Pages that ask for webcam/microphone access
        ]
    };
    const browser = await puppeteer.launch(queryParams.launchOptions);
    if (!queryParams.timeout) {
        queryParams.timeout = DEFAULT_TIMEOUT_SECONDS;
    }
    queryParams._browser = browser;
    fieldValuesToNumber(queryParams, 'width', 'height', 'quality', 'scaleFactor', 'timeout', 'delay', 'offset');
    if (queryParams.plainPuppeteer === 'true') {
        await tryWithPuppeteer(url, queryParams, res);
    } else {
        try {
            const buffer = await captureWebsite.buffer(url, queryParams);
            latest.capture = buffer;
            const responseType = getResponseType(queryParams);
            res.type(responseType).send(buffer);
        } catch (e) {
            console.info(`Capture website failed for URL: ${url}`);
            console.info('Retrying with plain Puppeteer...');
            await tryWithPuppeteer(url, queryParams, res);
        }
    }
    browser.close();
}

async function tryWithPuppeteer(url, queryParams, res) {
    try {
        const buffer = await takePlainPuppeteerScreenshot(url, queryParams);
        latest.capture = buffer;
        const responseType = getResponseType(queryParams);
        res.type(responseType).send(buffer);
    } catch (e) {
        console.log('Capture failed due to: ' + e.message);
        res.status(500).send(e.message);
    }
}

function getResponseType(queryParams) {
    if (queryParams.type && queryParams.type === 'jpeg') {
        return 'jpg';
    }
    return 'png';
}

function fieldValuesToNumber(obj, ...fields) {
    fields.forEach(f => {
        if (obj[f]) {
            const val = Number(obj[f]);
            obj[f] = Number.isNaN(val) ? obj[f] : val;
        }
    });
}

function latestCapturePage(req, res) {
    let page = '';
    page += '<html lang="en">\n';
    page += '<body>\n';
    page += '<h1>Latest capture</h1>';
    if (latest.capture) {
        page += '<p>Date: ' + latest.date + '</p>\n';
        page += '<img src="/latest" width="800"  alt="Latest capture"/>\n';
    } else {
        page += '<p>No capture found!</p>\n';
    }
    page += '</body>\n';
    page += '</html>\n';
    res.send(page);
}

function latestCapture(req, res) {
    res.type('png');
    res.send(latest.capture);
}

module.exports = {
    showResults: showResults,
    validRequest: validRequest,
    latestCapture: latestCapture,
    capture: capture,
    latestCapturePage: latestCapturePage,
    fieldValuesToNumber: fieldValuesToNumber,
    getResponseType: getResponseType
};