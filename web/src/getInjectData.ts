import { type IInjectData } from "../../src/start";
/**
 * 获取注入数据
 * @returns 
 */
export function getInjectData(): IInjectData & {
    /** ws连接key */
    ws_key: string;
} {
    return {
        // @ts-ignore
        wsPort: $__wsPort__,
        ws_key: new URL(window.location.href).searchParams.get('ws_key'),
    };
}