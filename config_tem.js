/**
 * 配置文件
 * 详细配置项见说明，或者直接看类型声明
 * ${description}
 */
let getConfig;
try {
    getConfig = require("$__name__").getConfig;
} catch {
    getConfig = (_) => Promise.resolve(_());
}

module.exports = getConfig(() => {
    /**
     * 返回配置信息
     * TODO 可以是Promise
     */
    return $__def__
})