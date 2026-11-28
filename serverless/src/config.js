const getSecret = () => process.env.SECRET;
const getPublicHostValidation = () => process.env.PUBLIC_HOST_VALIDATION || 'true';

module.exports = {
    getSecret: getSecret,
    getPublicHostValidation: getPublicHostValidation
}