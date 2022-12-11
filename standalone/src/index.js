import express from 'express';
import {doCaptureWork, latestCapture, latestCapturePage, queue, showResults, allowedRequest} from "./helpers.js";
import {getConcurrency, getMaxQueueLength} from "./config.js";

const port = process.env.PORT || 8080;
const app = express();

async function capture(req, res) {
    if (!allowedRequest(req.query)) {
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
    await queue.add(async () => {
        const result = await doCaptureWork(req.query);
        if (result.statusCode === 200) {
            res.status(result.statusCode).type(result.responseType).send(result.buffer);
        } else {
            res.status(result.statusCode).send(result.message);
        }
    });
}

app.get('/capture', capture);

if (showResults()) {
    app.get('/', latestCapturePage);
    app.get('/latest', latestCapture);
}

app.listen(port, () => console.log(`listening at port ${port}...`));