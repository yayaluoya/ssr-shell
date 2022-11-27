if (typeof (window as any).SSRShellT != 'undefined') {
    console.log('ssr处理');
    (window as any).SSRShellT.on('requst', undefined, (res: any, back: Function) => {
        console.log('监听到消息', res);
        let str = document.body.parentElement!.outerHTML;
        str += `
            // ssr 处理加入的东西
            ${JSON.stringify(res)}
        `;
        back(str);
    });
}

export { };
