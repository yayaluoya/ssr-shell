import path from "path";

/**
 * 路径补全
 * @param url 
 * @param cwd 
 * @returns 
 */
export function pathCompletion(url: string, cwd: string = process.cwd()) {
    if (path.isAbsolute(url)) {
        return url;
    } else {
        return path.join(cwd, url);
    }
}