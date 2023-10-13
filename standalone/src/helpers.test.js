import {
    allowedRequest,
    doCaptureWork,
    fieldValuesToNumber,
    getOptions,
    getResponseType,
    latestCapturePage,
    showResults
} from "./helpers";
import {expect, jest} from '@jest/globals'


test('show results default off', () => {
    expect(showResults()).toBeFalsy();
});

test('show results on with environment variable', () => {
    process.env.SHOW_RESULTS = 'true';

    expect(showResults()).toBeTruthy();

    process.env.SHOW_RESULTS = undefined;
});

test('generate homepage', () => {
    const res = {send: jest.fn()};

    latestCapturePage({}, res);

    expect(res.send).toBeCalledTimes(1);
});

test('all requests are allowed by default', () => {
    expect(allowedRequest({})).toBeTruthy();
});

test('all requests are rejected if secret is set and request contains no secret value', () => {
    process.env.SECRET = 'hello';

    expect(allowedRequest({})).toBeFalsy();
    expect(allowedRequest({query: {}})).toBeFalsy();

    delete process.env.SECRET;
});

test('all requests are allowed when secrets match', () => {
    process.env.SECRET = 'hello';

    expect(allowedRequest({secret: 'world'})).toBeFalsy();
    expect(allowedRequest({secret: 'hello'})).toBeTruthy();

    delete process.env.SECRET;
});

test('field values to number', () => {
    const obj = {aap: '5', noot: '6', mies: 'seven'};

    fieldValuesToNumber(obj, 'aap');

    expect(typeof obj.aap).toBe('number');
    expect(typeof obj.noot).toBe('string');
    expect(typeof obj.mies).toBe('string');
});

test('field values to number, multiple fields', () => {
    const obj = {aap: '5', noot: '6', mies: 'seven'};

    fieldValuesToNumber(obj, 'aap', 'noot');

    expect(typeof obj.aap).toBe('number');
    expect(typeof obj.noot).toBe('number');
    expect(typeof obj.mies).toBe('string');
});

test('field values to number, no number value', () => {
    const obj = {aap: '5', noot: '6', mies: 'seven'};

    fieldValuesToNumber(obj, 'mies');

    expect(typeof obj.mies).toBe('string');
    expect(obj.mies).toBe('seven');
});

test('get response type', () => {
    expect(getResponseType({})).toBe('png');
    expect(getResponseType({type: 'jpeg'})).toBe('jpg');
    expect(getResponseType({type: 'png'})).toBe('png');
});

test('do real capture', async () => {
    const queryParameters = {url: 'https://robvanderleek.github.io'};
    let resultType = undefined;
    let resultBuffer = undefined;

    function type(t) {
        resultType = t;

        function send(buffer) {
            resultBuffer = buffer;
        }

        return {send: send};
    }

    const res = {type: type};

    const result = await doCaptureWork(queryParameters);
    res.type(result.responseType).send(result.buffer);

    expect(resultType).toBe('png');
    expect(resultBuffer).toBeDefined();
});

test('get options', () => {
    const result = getOptions({
        'url': 'https://amazon.com',
        'width': '650',
        'height': '350',
    });
    expect(result.width).toBe(650);
    expect(result.height).toBe(350);
})