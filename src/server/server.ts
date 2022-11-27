import express from "express";
import { Request, Response } from "express";
import { URLT } from "yayaluoya-tool/dist/http/URLT";
import { fileRes } from "./fileRes";
import path from "path";
import { IConfig } from "../config/IConfig";
import PortTool from "../tool/PortTool";
import { injectScriptName } from "../const";
import { HttpStatus } from "yayaluoya-tool/dist/http/HttpStatus";
import mime from "mime";

/**
 * 主服务
 * @param port 
 */
export function server(config: IConfig, puppeteerHandel: (req: Request, res: Response) => void): Promise<{
    /** 端口 */
    port: number;
    /** 本地地址 */
    url: string;
}> {
    const app = express()
    app.use(
        express.json(), // for parsing application/json
        express.urlencoded({ extended: true }),// for parsing application/x-www-form-urlencoded
    )
    app.all('*', (req, res) => {
        let url = new URLT(req.url);
        switch (true) {
            case config.homeReg.test(url.path):
                puppeteerHandel(req, res);
                break;
            case URLT.contrast(url.path, injectScriptName):
                res.writeHead(HttpStatus.OK, {
                    'content-type': mime.getType('.js'),
                });
                res.end('');
                break;
            default:
                fileRes(path.join(config.proxyDir, url.path), res, {
                    err: () => {
                        puppeteerHandel(req, res);
                    },
                });
                break;
        }
    });
    // 是否是自动获取port
    let p = config.port ? Promise.resolve(config.port) : PortTool.getPool();
    return p.then(port => {
        return new Promise((r, e) => {
            app.listen(port, () => {
                r({
                    port,
                    url: `http://localhost:${port}`,
                });
            });
        });
    });
}