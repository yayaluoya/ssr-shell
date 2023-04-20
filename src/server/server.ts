import {
    IncomingMessage,
    ServerResponse
} from "http";
import { URLT } from "yayaluoya-tool/dist/http/URLT";
import { IConfig } from "../config/IConfig";
import PortTool from "../tool/PortTool";
import { injectScriptName } from "../const";
import mime from "mime";
import { createProxyServer } from "../tool/createProxyServer";

/**
 * 主服务
 * @param port 
 */
export function server(config: IConfig, localProxyUrl: string, puppeteerHandel: (req: IncomingMessage, res: ServerResponse) => void): Promise<{
    /** 端口 */
    port: number;
    /** 本地地址 */
    url: string;
}> {
    const proxyServer = createProxyServer({
        target: localProxyUrl,
        selfHandleResponse: true,
        ws: true,
    }, (proxyRes, req, res, def) => {
        let url = new URLT(req.url);
        let end = (_, h = {}) => {
            let headers = {
                ...proxyRes.headers,
                ...h,
            };
            delete headers['content-length'];
            res.writeHead(proxyRes.statusCode, headers);
            res.end(_);
        }
        switch (true) {
            // 处理页面
            case (
                config.puppeteerIntercept
                    ? config.puppeteerIntercept(req) : true
            )
                && proxyRes.headers["content-type"] == mime.getType('.html'):
                puppeteerHandel(req, res);
                break;
            // 处理注入脚本内容
            case URLT.contrast(url.path, injectScriptName):
                end('', {
                    'content-type': mime.getType('.js'),
                });
                break;
            default:
                def();
                break;
        }
    });
    // 是否是自动获取port
    let p = config.port ? Promise.resolve(config.port) : PortTool.getPool();
    return p.then(port => {
        proxyServer.listen(port);
        return {
            port,
            url: `http://localhost:${port}`,
        };
    });
}