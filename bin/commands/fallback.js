"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFallback = void 0;
function getFallback(service) {
    // 当正常解析失败时，重定向模块请求。
    // https://webpack.docschina.org/configuration/resolve/#resolvefallback
    let fallback = {
        fs: false,
    };
    if (service.isWeb() || service.isChromePlugin() || service.isElectron()) {
        // web情况下： 模块重定向，不需要的设置为false即可
        fallback = Object.assign(fallback, {
            assert: require.resolve("assert"),
            net: require.resolve("net-browserify/browser.js"),
            path: require.resolve("path-browserify"),
            zlib: require.resolve("browserify-zlib"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util/"),
            buffer: require.resolve("browserify-buffer"),
            crypto: require.resolve("crypto-browserify"),
            os: require.resolve("os-browserify/browser"),
            timers: require.resolve("timers-browserify"),
            constants: require.resolve("constants-browserify"),
            process: require.resolve("process/browser"),
            querystring: require.resolve("querystring-es3"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            vm: require.resolve("vm-browserify"),
            tls: false,
            express: require.resolve("@xuyanfeng/express-browserify"),
            fs: require.resolve("@xuyanfeng/fs-browserify"),
            sharp: require.resolve("@xuyanfeng/sharp-browserify"),
            chokidar: require.resolve("@xuyanfeng/chokidar-browserify"),
            electron: false,
            async_hooks: false,
            string_decoder: false,
            child_process: require.resolve("child_process-browserify"),
            'fs-extra': require.resolve("@xuyanfeng/fs-extra-browserify"),
        });
    }
    return fallback;
}
exports.getFallback = getFallback;
//# sourceMappingURL=fallback.js.map