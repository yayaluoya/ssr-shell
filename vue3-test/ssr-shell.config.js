/**
 * 配置文件
 * 详细配置项见说明，或者直接看类型声明
 * 用更简单方便的方式实现服务端渲染
 */
let getConfig;
try {
    getConfig = require("ssr-shell").getConfig;
} catch {
    getConfig = (_) => Promise.resolve(_());
}

const path = require('path');

module.exports = getConfig(() => {
    /**
     * 返回配置信息
     * TODO 可以是Promise
     */
    return {
        "proxyDir": path.join(__dirname, './dist'),
        "port": 3415
    }
})