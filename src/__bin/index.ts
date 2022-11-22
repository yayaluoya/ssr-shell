#!/usr/bin/env node
import { getCmdOp, IOp as IOp_ } from "yayaluoya-tool/dist/node/getCmdOp";
import { IConfig } from "../config/IConfig";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { configTemName, defaultConfig as defaultConfig_, getConfig, getConfigTem, getCwdConfig, packageJSON, projectConfigUrl } from "../config/getConfig";
import { cmdSecondCom } from "yayaluoya-tool/dist/node/cmdSecondCom"
import { PathConst } from "../tool/PathConst";
import { ObjectUtils } from "yayaluoya-tool/dist/obj/ObjectUtils";
import { pathCompletion } from "../tool/pathCompletion";
import { ConfigManager } from "../config/ConfigManager";

interface IOp extends IOp_ {
    /** 帮助 */
    help: boolean;
    /** 初始化配置文件 */
    init: boolean;
    /** 查看配置文件 */
    debugConfig: string;
    /** 配置文件 */
    config: string;
}

let cmdOp = getCmdOp<IOp &
    Pick<
        IConfig,
        'port' | 'proxyDir'
    >
>((pro) => {
    pro.option('-h --help')
        .option('-i --init')
        .option('-c --config <path>')
        .option('-dc --debug-config [path]')
        .option('-pd --proxy-dir')
        .option('-p --port')
});

(async () => {
    /** 一个克隆的默认配置 */
    const defaultConfig = ObjectUtils.clone2(await defaultConfig_);

    switch (true) {
        case cmdOp.version:
            console.log(chalk.green('当前工具版本@ ') + chalk.yellow(packageJSON.version));
            break;
        case cmdOp.help:
            console.log(chalk.hex('#d2e603')(`${packageJSON.name}的所有命令😀:`));
            console.log(chalk.green('   -v --version ') + chalk.gray('查看当前工具版本'));
            console.log(chalk.green('   -h --help ') + chalk.gray('查看所有的命令和帮助信息'));
            console.log(chalk.green('   -i --init ') + chalk.gray('初始化配置文件'));
            console.log(chalk.green('   -dc --debug-config [path] ') + chalk.gray('查看某个配置文件'));
            console.log(chalk.green('   -c --config <path> ') + chalk.gray('用指定配置文件来运行'));
            console.log(chalk.green('   -pd --proxy-dir ') + chalk.gray('指定代理目录执行'));
            console.log(chalk.green('   -p --port ') + chalk.gray('指定端口执行'));
            break;
        case Boolean(cmdOp.init):
            let p = Promise.resolve();
            if (fs.statSync(projectConfigUrl, {
                throwIfNoEntry: false,
            })?.isFile()) {
                p = cmdSecondCom(`已经存在配置文件了${projectConfigUrl}，是否覆盖 是:y/Y 输入其他字符取消: `).then((input) => {
                    if (!/^y$/i.test(input)) {
                        throw '';
                    }
                })
            }
            p.then(() => {
                return getConfigTem().then((s) => {
                    fs.writeFileSync(projectConfigUrl, s);
                    console.log(chalk.green(`配置文件创建成功 ${projectConfigUrl}`));
                });
            }).catch((e) => {
                console.log('已取消');
                console.log(e);
            });
            break;
        case Boolean(cmdOp.debugConfig):
            console.log(chalk.yellow('配置信息：'));
            if (typeof cmdOp.debugConfig == 'string') {
                console.dir(
                    ObjectUtils.merge(defaultConfig, await getConfig(pathCompletion(cmdOp.debugConfig), '配置文件导入错误!')),
                    { depth: null }
                );
            } else {
                console.dir(
                    ObjectUtils.merge(defaultConfig, await getCwdConfig()),
                    { depth: null }
                );
            }
            break;
        default:
            //合并指定配置
            if (Boolean(cmdOp.config)) {
                ObjectUtils.merge(defaultConfig, await getConfig(pathCompletion(cmdOp.config), '配置文件导入错误，将以默认配置运行!'))
            } else {
                ObjectUtils.merge(defaultConfig, await getCwdConfig())
            }
            //合并命令行参数中的配置
            let cwdConfig: Partial<IConfig> = {};
            cmdOp.proxyDir && (cwdConfig.proxyDir = cmdOp.proxyDir);
            cmdOp.port && (cwdConfig.port = cmdOp.port);
            ObjectUtils.merge(defaultConfig, cwdConfig);
            //
            let config = await ConfigManager.handleConfig(defaultConfig);
            ConfigManager.config = config;
            //
            console.log('配置', config);
            break;
    }
})();