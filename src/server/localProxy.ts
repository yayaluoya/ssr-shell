import express from "express";
import PortTool from "../tool/PortTool";
import { URLT } from "yayaluoya-tool/dist/http/URLT"
import path from "path";
import { injectScriptName, injectScriptUrl } from "../const";
import { temDataInject } from "../tool/temDataInject";
import { IConfig } from "../config/IConfig";
import { fileRes } from "./fileRes";
import { ObjectUtils } from "yayaluoya-tool/dist/obj/ObjectUtils";
import { createProxyServer } from "../tool/createProxyServer";

/**
 * 注入脚本连接
 * @param b 
 * @returns 
 */
function injectScript(b: string | Buffer) {
    //TODO 注入工具需要的脚本
    return b.toString().replace(/(<script[^>]*>)/, `<script src="/${injectScriptName}"></script>\n$1`);
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
        let proxyServer = createProxyServer({
            target: `http://${op.proxyServer.host}:${op.proxyServer.port}`,
            selfHandleResponse: true,
            ws: true,
        }, (proxyRes, req, res, def, getBody) => {
            let url = new URLT(req.url);
            let end = (_) => {
                let headers = ObjectUtils.clone2(proxyRes.headers);
                delete headers['content-length'];
                res.writeHead(proxyRes.statusCode, headers);
                res.end(_);
            }
            switch (true) {
                // 主页
                case op.homeReg.test(url.path):
                    getBody().then((body) => {
                        end(injectScript(body));
                    });
                    break;
                // 注入脚本内容
                case URLT.contrast(url.path, injectScriptName):
                    fileRes(injectScriptUrl, res, {
                        trasform: (b) => {
                            return temDataInject(b.toString(), {
                                ...injectScriptOp,
                            });
                        }
                    });
                    break;
                default:
                    def();
                    break;
            }
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
                // 主页
                case op.homeReg.test(url.path):
                    fileRes(path.join(op.proxyDir, op.home), res, {
                        trasform: injectScript,
                    });
                    break;
                // 注入脚本内容
                case URLT.contrast(url.path, injectScriptName):
                    fileRes(injectScriptUrl, res, {
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
