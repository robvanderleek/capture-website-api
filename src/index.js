const express = require('express');
const captureWebsite = require('capture-website');
const app = express();
const port = process.env.PORT || 3000;

function capture(req, res) {
    const queryParams = req.query;
    const url = queryParams.url;
    console.log('URL: ' + url);
    console.log(req.query);
    console.log('capturing...');
    queryParams.launchOptions = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    };
    captureWebsite.buffer(url, queryParams).then((buffer) => res.send(buffer));
}

app.get('/capture', capture);

app.listen(port, () => console.log('listening...'));
