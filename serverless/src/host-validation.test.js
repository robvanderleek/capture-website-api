const {isPublicHost} = require("./host-validation");

test('is public host', async () => {
    expect(await isPublicHost('example.com')).toBeTruthy();
    expect(await isPublicHost('8.8.8.8')).toBeTruthy();
    expect(await isPublicHost('1.1.1.1')).toBeTruthy();
    expect(await isPublicHost('172.32.0.1')).toBeTruthy(); // just above 172.16/12
    expect(await isPublicHost('11.0.0.1')).toBeTruthy();

    expect(await isPublicHost('0.0.0.0')).toBeFalsy();
    expect(await isPublicHost('10.0.0.1')).toBeFalsy();
    expect(await isPublicHost('172.16.0.1')).toBeFalsy();
    expect(await isPublicHost('192.168.1.1')).toBeFalsy();
    expect(await isPublicHost('127.0.0.1')).toBeFalsy();
    expect(await isPublicHost('169.254.169.254')).toBeFalsy();
    expect(await isPublicHost('::1')).toBeFalsy();
    expect(await isPublicHost('localhost')).toBeFalsy();
    expect(await isPublicHost('2130706433')).toBeFalsy();
    expect(await isPublicHost('0x7f000001')).toBeFalsy();
    expect(await isPublicHost('::ffff:127.0.0.1')).toBeFalsy();
});