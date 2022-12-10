export const getDefaultTimeoutSeconds = () => parseInt(process.env.TIMEOUT) || 10;
export const getSecret = () => process.env.SECRET;
