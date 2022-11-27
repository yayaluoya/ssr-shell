import { Request, Response } from "express";
import { instanceTool } from "yayaluoya-tool/dist/instanceTool";
import puppeteer, { Browser, Page } from 'puppeteer';
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
    async handle(req: Request, res: Response, homeUrl: string) {
        let { url, headers } = req;
        const page = await this.browser.newPage();
        let ws_key = Crypto.md5(Date.now() + Math.random().toString());
        await page.goto(`${homeUrl}?ws_key=${ws_key}`);
        res.writeHead(HttpStatus.OK, {
            'content-type': mime.getType('.html'),
        });
        SocketManager.instance.requst(ws_key, url, headers as any)
            .then((content) => {
                if (!content) {
                    return page.content();
                }
            })
            .then(content => {
                res.end(content)
            })
            .catch(e => {
                console.log('向web端请求失败', e);
                return page.content().then(content => {
                    res.end(content);
                });
            }).finally(() => {
                page.close();
            });
    }
}