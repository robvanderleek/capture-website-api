import express from 'express';
import {capture, latestCapture, latestCapturePage, showResults} from "./helpers.js";

const port = process.env.PORT || 8080;
const app = express();
app.get('/capture', capture);
if (showResults()) {
    app.get('/', latestCapturePage);
    app.get('/latest', latestCapture);
}

app.listen(port, () => console.log(`listening at port ${port}...`));