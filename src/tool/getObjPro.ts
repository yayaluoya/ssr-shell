import { ObjectUtils } from "yayaluoya-tool/dist/obj/ObjectUtils";

/**
 * 获取对象目标属性提取的新对象
 * @param obj 
 * @param keys 
 * @returns 
 */
export function getObjPro<T>(obj: T, keys: (keyof T)[]) {
    let o: T = {} as any;
    for (let i of keys) {
        o[i] = ObjectUtils.clone2(obj[i]);
    }
    return o;
}