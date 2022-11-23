/**
 * 模板数据注入
 * @param tem 
 * @param data 
 */
export function temDataInject(tem: string, data: Record<string, any>): string {
    return tem.replace(/(\$__(\w+)__)/g, (_, __, c) => {
        return data[c] + '';
    })
}