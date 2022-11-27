import { ConfigManager } from "./config/ConfigManager";
import { IConfig } from "./config/IConfig";
import PortTool from "./tool/PortTool";
import { localProxy } from "./server/localProxy";
import { SocketManager } from "./server/SocketManager";
import { server } from "./server/server";
import { PuppeteerHandelT } from "./puppeteer/PuppeteerHandelT";
import { packageJSON } from "./config/getConfig";

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
    let { url: localProxyUrl } = await localProxy({
        dir: config.proxyDir,
        home: config.home,
        homeReg: config.homeReg,
    }, injectData);
    await PuppeteerHandelT.instance.start();
    let { port, url } = await server(config, (req, res) => {
        PuppeteerHandelT.instance.handle(req, res, localProxyUrl, config.timeoutTime);
    });
    console.log(`${packageJSON.name}:`);
    console.log('本地代理服务', localProxyUrl);
    console.log('外部访问服务', url);
}