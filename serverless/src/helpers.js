const {getSecret} = require('./config.js');
const puppeteer = require('puppeteer-core');
const chromium = require("@sparticuz/chromium");
const {isPublicHost} = require("./host-validation");
const {getPublicHostValidation} = require("./config");

async function validateUrl(url) {
    if (!URL.canParse(url)) {
        return false;
    }
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
    }
    return getPublicHostValidation() === 'false' || await isPublicHost(urlObj.hostname);
}

async function doCaptureWork(queryParameters) {
    const options = await getOptions(queryParameters);
    const url = options.url;
    if (!await validateUrl(url)) {
        return {
            statusCode: 400,
            message: 'Invalid URL'
        }
    }
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
            ...chromium.default.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--hide-scrollbars',
            '--mute-audio',
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-zygote",
            '--use-fake-ui-for-media-stream' // Pages that ask for webcam/microphone access
        ],
        executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.default.executablePath(),
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
        await blockNonPublicRequests(page);
        await page.goto(url);
        await setViewport(page, options);
        await new Promise(r => setTimeout(r, options.wait_before_screenshot_ms));
        const array = await page.screenshot();
        buffer = Buffer.from(array);
    } catch (e) {
        console.error('Error during Puppeteer screenshot capture: ', e);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    return buffer;
}

async function blockNonPublicRequests(page) {
    await page.setRequestInterception(true);
    page.on('request', async request => {
        const requestUrl = new URL(request.url());
        if (requestUrl.protocol === 'data:' || requestUrl.protocol === 'blob:') {
            return await request.continue();
        }
        if (requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:') {
            if (getPublicHostValidation() === 'false' || await isPublicHost(requestUrl.hostname)) {
                return await request.continue();
            }
        }
        return await request.abort('accessdenied');
    });
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
    fieldValuesToNumber: fieldValuesToNumber,
    validateUrl: validateUrl,
}
