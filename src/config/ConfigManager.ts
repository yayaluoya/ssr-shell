import { pathCompletion } from "../tool/pathCompletion";
import PortTool from "../tool/PortTool";
import { IConfig } from "./IConfig";

/**
 * 配置管理器
 */
export class ConfigManager {
    private static config_: IConfig;

    static get config() {
        return this.config_;
    }
    static set config(c: IConfig) {
        this.config_ = c;
    }

    /** 处理路径 */
    static async handleConfig(c: IConfig) {
        /** 转换路径 */
        c.proxyDir = pathCompletion(c.proxyDir || '');
        /** 分配端口 */
        if (!c.port) {
            c.port = await PortTool.getPool();
        }
        c.homeReg || (c.homeReg = /^$|^\/$|^\/index.html$/);
        c.home || (c.home = 'index.html');
        //
        return c;
    }
}