import { BaseEvent } from "yayaluoya-tool/dist/BaseEvent";
import { WS } from "yayaluoya-tool/dist/web/WS";
import { getInjectData } from "./getInjectData";
import { instanceTool } from "yayaluoya-tool/dist/instanceTool";

/**
 * SSRShell工具
 */
@instanceTool()
export class SSRShellT extends BaseEvent<'requst'> {
    static instance: SSRShellT;
    ws = new WS(`ws://localhost:${getInjectData().wsPort}/${getInjectData().ws_key}`);

    constructor() {
        super();
        this.ws.on('message', this, ({ data }) => {
            let { key, res } = JSON.parse(data);
            this.emit('requst', res, (req) => {
                this.ws.send(JSON.stringify({
                    key,
                    req,
                }))
            });
        });
    }
}