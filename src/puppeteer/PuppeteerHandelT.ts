import {
    IncomingMessage,
    ServerResponse
} from "http";
import { instanceTool } from "yayaluoya-tool/dist/instanceTool";
import puppeteer, { Browser } from 'puppeteer';
import { HttpStatus } from "yayaluoya-tool/dist/http/HttpStatus";
import mime from "mime";
import { Crypto } from "yayaluoya-tool/dist/Crypto";
import { SocketManager } from "../server/SocketManager";

/**
 * 浏览器工具
 */
@instanceTool()
export class PuppeteerHandelT {
    static instance: PuppeteerHandelT;

    /** 浏览器实例 */
    private browser: Browser;

    /**
     * 开始
     */
    async start() {
        this.browser = await puppeteer.launch();
    }

    /**
     * 处理
     * @param req 
     * @param res 
     * @param homeUrl 
     * @returns 
     */
    async handle(req: IncomingMessage, res: ServerResponse, homeUrl: string, timeoutTime?: number) {
        let { url, headers } = req;
        const page = await this.browser.newPage();
        let ws_key = Crypto.md5(Date.now() + Math.random().toString());
        await page.goto(`${homeUrl}?ws_key=${ws_key}`);
        res.writeHead(HttpStatus.OK, {
            'content-type': mime.getType('.html'),
        });
        SocketManager.instance.requst(ws_key, url, headers as any, timeoutTime)
            .then((content) => {
                return content || page.content();
            })
            .then(content => {
                res.end(content);
            })
            .catch(e => {
                console.error(e);
                return page.content().then(content => {
                    res.end(content);
                });
            }).finally(() => {
                page.close();
            });
    }
}