import { Request, Response } from "express";
import mime from "mime";
import { HttpStatus } from "yayaluoya-tool/dist/http/HttpStatus";
import fs from "fs";

/**
 * 文件响应
 * @param path 
 * @param res 
 */
export function fileRes(path: string, res: Response, op: {
    /** 转换 */
    trasform?: (_: Buffer | string) => Buffer | string;
    /** 错误处理 */
    err?: (path: string, res: Response) => void;
} = {}) {
    try {
        let _: Buffer | string = fs.readFileSync(path);
        _ = op.trasform ? op.trasform(_) : _;
        res.writeHead(HttpStatus.OK, {
            'content-type': mime.getType(path),
        }).end(_);
    } catch (e) {
        if (op.err) {
            op.err(path, res);
        } else {
            console.log('读取文件错误', e);
            res.writeHead(HttpStatus.NOT_FOUND).end();
        }
    }
}