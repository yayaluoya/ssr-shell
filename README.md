## ssr-shell 后端渲染外壳

#### 实现原理

先用一个服务（服务1）代理指定的目录，并且在代理的同时注入一个脚本（这个脚本会通过webSocket和服务端通信），这个服务会通过puppeteer打开。

然后再用一个服务（服务2）来中转在puppeteer中打开的服务1，并通过webSocket来和其中打开的单页面应用通信获取要返回的具体内容。