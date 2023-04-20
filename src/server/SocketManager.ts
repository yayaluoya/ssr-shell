import { SocketManager as SocketManager_ } from "yayaluoya-tool/dist/http/SocketManager";
import { instanceTool } from "yayaluoya-tool/dist/instanceTool";
import { BaseEvent } from "yayaluoya-tool/dist/BaseEvent";
import { Crypto } from "yayaluoya-tool/dist/Crypto";

/**
 * websocket服务
 */
@instanceTool()
export class SocketManager extends BaseEvent {
    /** 单例 */
    static instance: SocketManager;

    /**
     * 开始
     * @param port 
     * @param checkTime 
     * @returns 
     */
    start(port: number, checkTime?: number) {
        SocketManager_.instance.start(port, checkTime, false);
        SocketManager_.instance.on('message', this, (_, __, data) => {
            let { key, req } = JSON.parse(data.toString());
            this.emit(key, req);
        });
    }

    /**
     * 发送消息
     * @param key 目标key
     * @param data 消息体
     */
    sendMsg(key: string, data: any): number {
        return SocketManager_.instance.sendMsg(key, JSON.stringify(data));
    }

    /**
     * 发送请求
     * @param key 
     * @param url 
     * @param head 
     * @returns 
     */
    requst(key: string, url: string, head: Record<string, string>, timeoutTime = 3 * 1000): Promise<string> {
        return new Promise((r, e) => {
            let msgKey: string = Crypto.md5(Date.now() + Math.random().toString());
            this.sendMsg(key, {
                key: msgKey,
                res: {
                    url,
                    head,
                }
            });
            // 
            let time = setTimeout(() => {
                this.off(msgKey, this, r);
                e(`请求超时@${url}`);
            }, timeoutTime);
            this.onOnce(msgKey, this, (req) => {
                clearTimeout(time);
                r(req);
            });
        });
    }
}