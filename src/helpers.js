import captureWebsite from 'capture-website';
import puppeteer from 'puppeteer';
import PQueue from "p-queue";
import {getConcurrency, getDefaultTimeoutSeconds, getMaxQueueLength, getSecret, getShowResults} from "./config.js";
import 'dotenv/config';

const queue = new PQueue({concurrency: getConcurrency()});

const latest = {
    capture: undefined,
    url: undefined,
    date: undefined
};

export function showResults() {
    const showResults = getShowResults();
    return showResults && showResults === 'true';
}

export async function capture(req, res) {
    if (!validRequest(req)) {
        res.status(403).send('Go away please');
        return;
    }
    if (queue.size >= getMaxQueueLength()) {
        res.status(429).send('Maximum queue size reached, try again later');
        return;
    }
    if (queue.pending >= getConcurrency()) {
        console.log('Queueing request...');
    }
    await queue.add(() => doCaptureWork(req, res));
}

async function doCaptureWork(req, res) {
    latest.date = new Date();
    const queryParams = getQueryParameters(req);
    const url = queryParams.url;
    latest.url = url;
    console.info('Capturing URL: ' + url + ' ...');
    if (queryParams.plainPuppeteer === 'true') {
        await tryWithPuppeteer(url, queryParams, res);
    } else {
        try {
            const buffer = await captureWebsite.buffer(url, queryParams);
            console.info(`Successfully captured URL: ${url}`);
            latest.capture = buffer;
            const responseType = getResponseType(queryParams);
            res.type(responseType).send(buffer);
        } catch (e) {
            console.error(e);
            console.info(`Capture website failed for URL: ${url}`);
            console.info('Retrying with plain Puppeteer...');
            await tryWithPuppeteer(url, queryParams, res);
        }
    }
}

export function validRequest(req) {
    const secret = getSecret();
    if (!secret) {
        return true;
    }
    if (!req.query || !req.query.secret) {
        return false;
    }
    return req.query.secret === secret;
}

function getQueryParameters(req) {
    const result = getQueryParametersFromUrl(req);
    result.launchOptions = {
        // headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--hide-scrollbars',
            '--mute-audio',
            '--use-fake-ui-for-media-stream' // Pages that ask for webcam/microphone access
        ]
    };
    if (!result.timeout) {
        result.timeout = getDefaultTimeoutSeconds();
    }
    fieldValuesToNumber(result, 'width', 'height', 'quality', 'scaleFactor', 'timeout', 'delay', 'offset');
    return result;
}

function getQueryParametersFromUrl(req) {
    return Object.keys(req.query).reduce((params, key) => {
        const q = req.query[key];
        let value;
        try {
            value = JSON.parse(q);
        } catch {
            value = q
        }
        return {
            ...params,
            [key]: value
        }
    }, req.query || {});
}

async function tryWithPuppeteer(url, queryParams, res) {
    try {
        const buffer = await takePlainPuppeteerScreenshot(url, queryParams);
        console.info(`Successfully captured URL: ${url}`);
        latest.capture = buffer;
        const responseType = getResponseType(queryParams);
        res.type(responseType).send(buffer);
    } catch (e) {
        console.log('Capture failed due to: ' + e.message);
        res.status(500).send(e.message);
    }
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

export function getResponseType(queryParams) {
    if (queryParams.type && queryParams.type === 'jpeg') {
        return 'jpg';
    }
    return 'png';
}

export function fieldValuesToNumber(obj, ...fields) {
    fields.forEach(f => {
        if (obj[f]) {
            const val = Number(obj[f]);
            obj[f] = Number.isNaN(val) ? obj[f] : val;
        }
    });
}

export function latestCapturePage(req, res) {
    let page = '';
    page += '<html lang="en">\n';
    page += '<body>\n';
    page += '<h1>Latest capture</h1>';
    if (latest.capture) {
        const latestEndpoint = '/latest';
        page += '<p>Date: ' + latest.date + '</p>\n';
        page += `<img src="${latestEndpoint}" width="800"  alt="Latest capture"/>\n`;
    } else {
        page += '<p>No capture found!</p>\n';
    }
    page += '</body>\n';
    page += '</html>\n';
    res.send(page);
}

export function latestCapture(req, res) {
    res.type('png');
    res.send(latest.capture);
}