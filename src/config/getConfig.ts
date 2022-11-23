import chalk from "chalk";
import path from "path";
import fs from "fs";
import { PathConst } from "../tool/PathConst";
import { IConfig } from "./IConfig";
import { ConfigManager } from "./ConfigManager";
import { ObjectUtils } from "yayaluoya-tool/dist/obj/ObjectUtils";
import { temDataInject } from "../tool/temDataInject";

/**
 * 包配置文件
 */
export const packageJSON: {
    /** 名字 */
    name: string;
    /** 版本号 */
    version: string;
    /** 描述 */
    description: string;
} = require('../../package.json');
/**
 * 默认配置地址
 */
export const defaultConfigUrl = path.join(PathConst.toolRootPath, '/config');
/**
 * 默认配置
 */
export const defaultConfig = getConfig(defaultConfigUrl);
/**
 * 项目配置文件名字
 */
export const projectConfigName = `${packageJSON.name}.config.js`;
/**
 * 项目配置文件地址
 */
export const projectConfigUrl = path.join(process.cwd(), projectConfigName);

/** 配置模板文件名字 */
export const configTemName = 'config_tem.js'

/**
 * 获取cwd配置文件
 * @returns 
 */
export function getCwdConfig() {
    return getConfig(projectConfigUrl, '配置文件导入错误!')
}

/**
 * 根据路径获取自定义的配置文件
 * @param _url 
 * @param a 提示信息 
 */
export function getConfig(_url: string, a?: string): Promise<IConfig> {
    let config = Promise.resolve({
        proxyDir: '',
    });
    try {
        config = Promise.resolve(require(_url));
    } catch (e) {
        if (a) {
            console.log(chalk.red(a));
            console.log(e);
        }
    }
    return config;
}

/**
 * 获取配置模板字符串
 */
export async function getConfigTem(): Promise<string> {
    let defaultConfig_ = await ConfigManager.handleConfig(ObjectUtils.clone2(await defaultConfig));
    return temDataInject(
        fs.readFileSync(path.join(PathConst.toolRootPath, configTemName))
            .toString(),
        {
            name: packageJSON.name,
            description: packageJSON.description,
            def: JSON.stringify(defaultConfig_, undefined, 8),
        },
    );
}