import captureWebsite from 'capture-website';
import puppeteer from 'puppeteer';
import PQueue from "p-queue";
import {getConcurrency, getDefaultTimeoutSeconds, getSecret, getShowResults} from "./config.js";
import 'dotenv/config';

export const queue = new PQueue({concurrency: getConcurrency()});

const latest = {
    capture: undefined,
    url: undefined,
    date: undefined
};

export function showResults() {
    const showResults = getShowResults();
    return showResults && showResults === 'true';
}

export async function doCaptureWork(queryParameters) {
    latest.date = new Date();
    const options = getOptions(queryParameters);
    const url = options.url;
    latest.url = url;
    console.info('Capturing URL: ' + url + ' ...');
    if (options.plainPuppeteer === 'true') {
        return await tryWithPuppeteer(url, options);
    } else {
        try {
            const buffer = await captureWebsite.buffer(url, options);
            console.info(`Successfully captured URL: ${url}`);
            latest.capture = buffer;
            return {
                statusCode: 200,
                responseType: getResponseType(options),
                buffer: buffer
            }
        } catch (e) {
            console.error(e);
            console.info(`Capture website failed for URL: ${url}`);
            console.info('Retrying with plain Puppeteer...');
            return await tryWithPuppeteer(url, options);
        }
    }
}

export function allowedRequest(queryParameters) {
    const secret = getSecret();
    if (!secret) {
        return true;
    }
    if (!queryParameters || !queryParameters.secret) {
        return false;
    }
    return queryParameters.secret === secret;
}

export function getOptions(queryParameters) {
    const result = parseQueryParameters(queryParameters);
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

function parseQueryParameters(queryParameters) {
    return Object.keys(queryParameters).reduce((params, key) => {
        const q = queryParameters[key];
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
    }, queryParameters || {});
}

async function tryWithPuppeteer(url, options) {
    try {
        const buffer = await takePlainPuppeteerScreenshot(url, options);
        console.info(`Successfully captured URL: ${url}`);
        latest.capture = buffer;
        return {
            statusCode: 200,
            responseType: getResponseType(options),
            buffer: buffer
        }
    } catch (e) {
        console.log('Capture failed due to: ' + e.message);
        return {
            statusCode: 500,
            message: e.message
        }
    }
}

async function takePlainPuppeteerScreenshot(url, options) {
    options.encoding = 'binary';
    options.wait_before_screenshot_ms = options.wait_before_screenshot_ms || 300;
    let browser;
    let page;
    let buffer;
    try {
        browser = await puppeteer.launch(options.launchOptions);
        page = await browser.newPage();
        await page.goto(url);
        await setViewport(page, options);
        await new Promise(r => setTimeout(r, options.wait_before_screenshot_ms));
        buffer = await page.screenshot();
    } finally {
        await browser.close();
    }
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
