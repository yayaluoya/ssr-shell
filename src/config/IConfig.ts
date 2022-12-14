import {
    IncomingMessage
} from "http";

/**
 * 配置类型
 */
export interface IConfig {
    /** 代理目录 */
    proxyDir?: string;
    /** 代理服务 */
    proxyServer?: {
        host: string;
        port: number;
    },
    /** 主服务端口 */
    port?: number;
    /** 匹配主页的正则 */
    homeReg?: RegExp;
    /** 主页地址 */
    home?: string;
    /** web端响应的超时时间 */
    timeoutTime?: number;
    /** puppeteer拦截，如果返回false则会不用puppeteer中转 */
    puppeteerIntercept?: (req: IncomingMessage) => boolean;
}