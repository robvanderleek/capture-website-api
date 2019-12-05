const captureWebsite = require('capture-website');

const latest = {
    capture: undefined,
    url: undefined,
    date: undefined
};

function showResults() {
    const showResults = process.env.SHOW_RESULTS;
    return showResults && showResults === 'true';
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

function capture(req, res) {
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
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    };
    fieldValuesToNumber(queryParams, 'width', 'height', 'quality', 'scaleFactor', 'timeout', 'delay', 'offset');
    captureWebsite.buffer(url, queryParams).then((buffer) => {
        latest.capture = buffer;
        const responseType = getResponseType(queryParams);
        res.type(responseType).send(buffer);
    }).catch((e) => {
        console.log('Capture failed due to: ' + e.message);
        res.status(500).send(e.message);
    });
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
        page += '<img src="/latest" width="800" />\n';
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