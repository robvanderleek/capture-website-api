const {allowedRequest, doCaptureWork} = require('../src/helpers.js');

const handler = async function (request, response) {
    if (!allowedRequest(request.query)) {
        response.status(403).json({message: 'Go away please'})
    }
    const result = await doCaptureWork(request.query);
    if (result.statusCode === 200) {
        response.status(200).setHeader("Content-Type", `image/${result.responseType}`).send(result.buffer)
    } else {
        response.status(result.statusCode).json({message: result.message})
    }
}

module.exports = handler
