import { IConfig } from "../config/IConfig";

/**
 * 获取配置
 * 主要是为外界提供ts的能力
 * @param c 
 * @returns 
 */
export function getConfig(f: () => IConfig | Promise<IConfig>) {
    return f();
}