const getDefaultTimeoutSeconds = () => parseInt(process.env.TIMEOUT) || 10;
const getSecret = () => process.env.SECRET;

module.exports = {
    getDefaultTimeoutSeconds: getDefaultTimeoutSeconds,
    getSecret: getSecret
}