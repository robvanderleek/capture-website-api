const {getSecret} = require('./config.js');
const puppeteer = require('puppeteer-core');
const chromium = require("@sparticuz/chromium");

async function doCaptureWork(queryParameters) {
    const options = await getOptions(queryParameters);
    const url = options.url;
    console.info('Capturing URL: ' + url + ' ...');
    return await tryWithPuppeteer(url, options);
}

function allowedRequest(queryParameters) {
    const secret = getSecret();
    if (!secret) {
        return true;
    }
    if (!queryParameters || !queryParameters.secret) {
        return false;
    }
    return queryParameters.secret === secret;
}

async function getOptions(queryParameters) {
    const result = parseQueryParameters(queryParameters);
    result.launchOptions = {
        headless: true,
        args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--hide-scrollbars',
            '--mute-audio',
            '--use-fake-ui-for-media-stream' // Pages that ask for webcam/microphone access
        ],
        executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
    };
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

module.exports = {
    doCaptureWork: doCaptureWork,
    allowedRequest: allowedRequest,
    getResponseType: getResponseType,
    fieldValuesToNumber: fieldValuesToNumber
}
