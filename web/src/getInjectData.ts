import { type IInjectData } from "../../src/start";
/**
 * 获取注入数据
 * @returns 
 */
export function getInjectData(): IInjectData {
    return {
        // @ts-ignore
        wsPort: $__wsPort__,
    };
}