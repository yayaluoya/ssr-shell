import portfinder from "portfinder";
/**
 * 端口工具
 */
export default class PortTool {
    /** 当前获取端口的任务 */
    private static onGetPortTask: Promise<any> = Promise.resolve();

    /**
     * 获取一个未使用的端口
     */
    public static getPool(): Promise<number> {
        this.onGetPortTask = this.onGetPortTask.then(() => {
            return portfinder.getPortPromise().then((prot) => {
                return prot;
            });
        })
        return this.onGetPortTask;
    }
}