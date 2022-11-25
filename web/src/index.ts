import { SSRShellT } from "./SSRShellT";

/** 注入到全局中 */
(window as any).SSRShellT = SSRShellT.instance;