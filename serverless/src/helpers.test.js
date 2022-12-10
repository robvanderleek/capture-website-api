const {allowedRequest, fieldValuesToNumber, getResponseType} = require("./helpers");
const {expect} = require('@jest/globals');

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