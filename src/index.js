const express = require('express');
const captureWebsite = require('capture-website');
const app = express();
const port = process.env.PORT || 3000;

let latestCapture = undefined;
let latestUrl = undefined;
let latestDate = undefined;

function capture(req, res) {
    latestDate = new Date();
    const queryParams = req.query;
    const url = queryParams.url;
    latestUrl = url;
    console.log('Capturing URL: ' + url + ' ...');
    queryParams.launchOptions = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    };
    captureWebsite.buffer(url, queryParams).then((buffer) => {
        latestCapture = buffer;
        res.send(buffer);
    });
}

function homepage(req, res) {
    let page = '';
    page += '<html lang="en">\n';
    page += '<body>\n';
    page += '<h1>Latest capture</h1>';
    if (latestCapture) {
        page += '<p>Date: ' + latestDate + '</p>\n';
        page += '<img src="/latest" width="800" />\n';
    } else {
        page += '<p>No capture found!</p>\n';
    }
    page += '</body>\n';
    page += '</html>\n';
    res.send(page);
};

app.get('/', homepage);
app.get('/capture', capture);
app.get('/latest', (req, res) => {
    res.type('png');
    res.send(latestCapture);
});


app.listen(port, () => console.log('listening...'));
