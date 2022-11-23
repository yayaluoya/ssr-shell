/**
 * 配置类型
 */
export interface IConfig {
    /** 代理目录 */
    proxyDir: string;
    /** 主服务端口 */
    port?: number;
    /** 匹配主页的正则 */
    homeReg?: RegExp;
    /** 主页地址 */
    home?: string;
}