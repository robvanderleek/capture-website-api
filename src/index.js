const helpers = require('./helpers.js');
const express = require('express');

const port = process.env.PORT || 3000;
const app = express();
app.get('/capture', helpers.capture);
if (helpers.showResults()) {
    app.get('/', helpers.homepage);
    app.get('/latest', helpers.latestCapture);
}

app.listen(port, () => console.log('listening...'));