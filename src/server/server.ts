import express from "express";
import { Request, Response } from "express";
import { URLT } from "yayaluoya-tool/dist/http/URLT";
import path from "path";
import { IConfig } from "../config/IConfig";
import PortTool from "../tool/PortTool";
import { injectScriptName } from "../const";
import { HttpStatus } from "yayaluoya-tool/dist/http/HttpStatus";
import mime from "mime";
import { fileRes } from "./fileRes";
import httpProxy from "http-proxy";
import { PathConst } from "../tool/PathConst";

/**
 * 主服务
 * @param port 
 */
export function server(config: IConfig, localProxyUrl: string, puppeteerHandel: (req: Request, res: Response) => void): Promise<{
    /** 端口 */
    port: number;
    /** 本地地址 */
    url: string;
}> {
    const proxyServer = httpProxy.createProxyServer({
        target: localProxyUrl,
        // 自己处理响应
        selfHandleResponse: true,
        ws: true,
    });
    proxyServer.on('proxyRes', (proxyRes, req, res) => {
        var body: any = [];
        proxyRes.on('data', (chunk) => {
            body.push(chunk);
        });
        proxyRes.on('end', () => {
            body = Buffer.concat(body).toString();
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
                case proxyRes.headers["content-type"] == 'text/html':
                    puppeteerHandel(req as any, res as any);
                    break;
                case URLT.contrast(url.path, injectScriptName):
                    end('', {
                        'content-type': mime.getType('.js'),
                    });
                    break;
                default:
                    end(body);
                    break;
            }
        });
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