const helpers = require("./helpers.js");

test('show results default off', () => {
    expect(helpers.showResults()).toBeFalsy();
});

test('show results on with environment variable', () => {
    process.env.SHOW_RESULTS = 'true';

    expect(helpers.showResults()).toBeTruthy();

    process.env.SHOW_RESULTS = undefined;
});

test('generate homepage', () => {
    const res = {send: jest.fn()};

    helpers.homepage({}, res);

    expect(res.send).toBeCalledTimes(1);
});

test('all requests are valid by default', () => {
    expect(helpers.validRequest({})).toBeTruthy();
});

test('all requests are invalid is secret is set and request contains no secret value', () => {
    process.env.SECRET = 'hello';

    expect(helpers.validRequest({})).toBeFalsy();
    expect(helpers.validRequest({query: {}})).toBeFalsy();

    process.env.SECRET = undefined;
});

test('all requests are valid when secrets match', () => {
    process.env.SECRET = 'hello';

    expect(helpers.validRequest({query: {secret: 'world'}})).toBeFalsy();
    expect(helpers.validRequest({query: {secret: 'hello'}})).toBeTruthy();

    process.env.SECRET = undefined;
});