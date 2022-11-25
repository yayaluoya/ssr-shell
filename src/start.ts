import { ConfigManager } from "./config/ConfigManager";
import { IConfig } from "./config/IConfig";
import PortTool from "./tool/PortTool";
import { localProxy } from "./server/localProxy";
import { SocketManager } from "./server/SocketManager";

/**
 * 注入数据类型
 */
export interface IInjectData {
    /** ws端口号 */
    wsPort: number;
}

/**
 * 工具入口
 * @param config 
 */
export async function start(config: IConfig) {
    config = await ConfigManager.handleConfig(config);
    ConfigManager.config = config;
    //开启webSocket
    let wsPort = await PortTool.getPool();
    SocketManager.instance.start(wsPort);
    let injectData: IInjectData = {
        wsPort
    };
    //开启本地项目代理
    let { port, url } = await localProxy({
        dir: config.proxyDir,
        home: config.home,
        homeReg: config.homeReg,
    }, injectData);
    console.log('本地代理服务', url);
}