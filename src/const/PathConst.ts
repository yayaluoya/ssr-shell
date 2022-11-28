import path from "path";

/**
 * 路径常量
 */
export class PathConst {
    /** 该工具根目录 */
    static get toolRootPath() {
        return path.join(__dirname, '../../');
    }

    /** web项目根目录 */
    static get webRootPath() {
        return path.join(this.toolRootPath, './web');
    }
    /** web项目打包目录 */
    static get webDistPath() {
        return path.join(this.webRootPath, './dist');
    }
}