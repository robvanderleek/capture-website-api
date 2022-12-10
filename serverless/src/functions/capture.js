const {allowedRequest} = require('../helpers.js');

const handler = async function (event, _) {
    if (!allowedRequest(event.queryStringParameters)) {
        return {
            statusCode: 403,
            body: JSON.stringify({message: 'Go away please'})
        };
    }
    // const result = await doCaptureWork(event.queryStringParameters);
    // if (result.statusCode === 200) {
    //     return {
    //         statusCode: 200,
    //         headers: {
    //             "Content-Type": `image/${result.responseType}`,
    //         },
    //         body: result.buffer.toString("base64"),
    //         isBase64Encoded: true
    //     };
    // } else {
    //     return {
    //         statusCode: result.statusCode,
    //         body: JSON.stringify({message: result.message})
    //     };
    // }
    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Hello world, this is a test'})
    };
}

module.exports = {
    handler: handler
}