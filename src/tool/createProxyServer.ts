import httpProxy, {
    ServerOptions,

} from "http-proxy";
import {
    IncomingMessage,
    ServerResponse
} from "http";

/**
 * 创建一个代理服务
 * @param op 
 * @param endB 处理body，如果selfHandleResponse为true的话必须要有该方法
 * @returns 
 */
export function createProxyServer(
    op: ServerOptions,
    endB?: (
        /** 被代理的响应 */
        proxyRes: IncomingMessage,
        req: IncomingMessage,
        res: ServerResponse,
        /** 默认处理 */
        def: () => void,
        /** 获取body内容，必须同步调用 */
        getBody: () => Promise<string>,
    ) => void
) {
    const proxyServer = httpProxy.createProxyServer(op);
    // 自己处理响应
    if (op.selfHandleResponse && endB) {
        proxyServer.on('proxyRes', (proxyRes, req, res) => {
            let getBody = () => {
                return new Promise<string>((r, e) => {
                    var body: any = [];
                    proxyRes.on('data', (chunk) => {
                        body.push(chunk);
                    });
                    proxyRes.on('end', () => {
                        body = Buffer.concat(body).toString();
                        r(body);
                    });
                    proxyRes.on('error', (err) => {
                        e(err);
                    });
                });
            }
            let def = () => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            }
            endB(proxyRes, req, res, def, getBody);
        });
    }
    return proxyServer;
}