import {fieldValuesToNumber, getResponseType, latestCapturePage, showResults, validRequest} from "./helpers";
import {jest} from '@jest/globals'


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

test('all requests are valid by default', () => {
    expect(validRequest({})).toBeTruthy();
});

test('all requests are invalid is secret is set and request contains no secret value', () => {
    process.env.SECRET = 'hello';

    expect(validRequest({})).toBeFalsy();
    expect(validRequest({query: {}})).toBeFalsy();

    process.env.SECRET = undefined;
});

test('all requests are valid when secrets match', () => {
    process.env.SECRET = 'hello';

    expect(validRequest({query: {secret: 'world'}})).toBeFalsy();
    expect(validRequest({query: {secret: 'hello'}})).toBeTruthy();

    process.env.SECRET = undefined;
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