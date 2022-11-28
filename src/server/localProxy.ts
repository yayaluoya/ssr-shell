import express from "express";
import PortTool from "../tool/PortTool";
import { URLT } from "yayaluoya-tool/dist/http/URLT"
import path from "path";
import { PathConst } from "../tool/PathConst";
import { injectScriptName } from "../const";
import { temDataInject } from "../tool/temDataInject";
import { IConfig } from "../config/IConfig";
import httpProxy from "http-proxy";
import { fileRes } from "./fileRes";

/**
 * 注入脚本连接
 * @param b 
 * @returns 
 */
function injectScript(b: string | Buffer) {
    let str = b.toString();
    //TODO 注入该工具需要的脚本
    // 在第一个脚本之前注入
    // console.log('注入脚本');
    return str.replace(/(<script[^>]*>)/, `<script src="/${injectScriptName}"></script>\n$1`);
}

/**
 * 本地代理服务
 * @param dir 需要代理的目录
 * @returns 
 */
export function localProxy(op: Pick<IConfig, 'proxyDir' | 'proxyServer' | 'home' | 'homeReg'>, injectScriptOp?: Record<string, any>): Promise<{
    /** 端口 */
    port: number;
    /** 本地地址 */
    url: string;
}> {
    // 如果是代理某个服务的话
    if (op.proxyServer) {
        const proxyServer = httpProxy.createProxyServer({
            target: `http://${op.proxyServer.host}:${op.proxyServer.port}`,
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
                let end = (_) => {
                    let headers = {
                        ...proxyRes.headers,
                    };
                    delete headers['content-length'];
                    res.writeHead(proxyRes.statusCode, headers);
                    res.end(_);
                }
                switch (true) {
                    case op.homeReg.test(url.path):
                        end(injectScript(body));
                        break;
                    case URLT.contrast(url.path, injectScriptName):
                        fileRes(path.join(PathConst.webDistPath, 'index.js'), res as any, {
                            trasform: (b) => {
                                return temDataInject(b.toString(), {
                                    ...injectScriptOp,
                                });
                            }
                        });
                        break;
                    default:
                        end(body);
                        break;
                }
            });
        });
        return PortTool.getPool().then((port) => {
            proxyServer.listen(port);
            return {
                port,
                url: `http://localhost:${port}`,
            };
        });
    }
    // 直接代理某个目录
    else {
        const app = express()
        app.use(
            express.json(), // for parsing application/json
            express.urlencoded({ extended: true }),// for parsing application/x-www-form-urlencoded
        )
        app.all('*', (req, res) => {
            let url = new URLT(req.url);
            switch (true) {
                case op.homeReg.test(url.path):
                    fileRes(path.join(op.proxyDir, op.home), res, {
                        trasform: injectScript,
                    });
                    break;
                case URLT.contrast(url.path, injectScriptName):
                    fileRes(path.join(PathConst.webDistPath, 'index.js'), res, {
                        trasform: (b) => {
                            return temDataInject(b.toString(), {
                                ...injectScriptOp,
                            });
                        }
                    });
                    break;
                default:
                    fileRes(path.join(op.proxyDir, url.path), res, {
                        err: () => {
                            fileRes(path.join(op.proxyDir, op.home), res);
                        },
                    });
                    break;

            }
        });
        return PortTool.getPool().then((port) => {
            return new Promise((r) => {
                app.listen(port, () => {
                    r({
                        port,
                        url: `http://localhost:${port}`,
                    });
                });
            });
        });
    }

}
