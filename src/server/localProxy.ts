import express from "express";
import PortTool from "../tool/PortTool";
import { pathCompletion } from "../tool/pathCompletion";
import { URLT } from "yayaluoya-tool/dist/http/URLT"
import path from "path";
import { PathConst } from "../tool/PathConst";
import { injectScriptName } from "../const";
import { fileRes } from "./fileRes";
import { temDataInject } from "../tool/temDataInject";

/** 配置项接口 */
export interface IOp {
    /** 代理目录 */
    dir: string;
    /** 匹配主页的正则 */
    homeReg?: RegExp;
    /** 主页地址 */
    home?: string;
}

/**
 * 本地代理服务
 * @param dir 需要代理的目录
 * @returns 
 */
export function localProxy(op: IOp, injectScriptOp?: Record<string, any>): Promise<{
    /** 端口 */
    port: number;
    /** 本地地址 */
    url: string;
}> {
    /** 配置项补全 */
    op = opHandle(op);

    const app = express()
    app.use(
        express.json(), // for parsing application/json
        express.urlencoded({ extended: true }),// for parsing application/x-www-form-urlencoded
    )
    app.all('*', (req, res) => {
        let url = new URLT(req.url);
        switch (true) {
            case op.homeReg.test(url.path):
                fileRes(path.join(op.dir, op.home), res, {
                    trasform: (b) => {
                        let str = b.toString();
                        //TODO 注入该工具需要的脚本
                        // 在第一个脚本之前注入
                        return str.replace(/(<script[^>]*>)/, `<script src="/${injectScriptName}"></script>\n$1`);
                    }
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
                fileRes(path.join(op.dir, url.path), res, {
                    err: () => {
                        fileRes(path.join(op.dir, op.home), res);
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



/**
 * 配置处理
 * @param op 
 */
function opHandle(op: IOp): IOp {
    op.dir = pathCompletion(op.dir);
    op.homeReg || (op.homeReg = /^$|^\/$|^\/index.html$/);
    op.home || (op.home = 'index.html');
    return op;
}