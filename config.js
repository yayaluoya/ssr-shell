const { getConfig } = require('./index');
/**
 * 默认配置文件
 */
module.exports = getConfig(() => {
    return {
        proxyDir: process.cwd(),
    };
});