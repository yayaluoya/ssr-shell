console.log('哈哈哈1234');
if (typeof (window as any).SSRShellT != 'undefined') {
    (window as any).SSRShellT.on('requst', undefined, (res: any, back: Function) => {
        console.log('监听到消息', res);
        let str = document.body.parentElement!.outerHTML;
        str += `
            // ssr 处理加入的东西1234
            ${JSON.stringify(res)}
        `;
        back(str);
    });
}

export { };
