import path from "path";
import { PathConst } from "./PathConst";

/**
 * 注入脚本名字
 */
export const injectScriptName = `injectScript-${Date.now()}.js`;
/**
 * 注入脚本地址
 */
export const injectScriptUrl = path.join(PathConst.webDistPath, 'index.js');