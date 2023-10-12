"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFallback = void 0;
function getFallback(service) {
    // https://webpack.docschina.org/configuration/resolve/#resolvefallback
    let fallback = {
        fs: false,
    };
    if (service.isWeb()) {
        // web情况下： 模块重定向，不需要的设置为false即可
        fallback = Object.assign(fallback, {
            assert: require.resolve("assert"),
            net: require.resolve("net-browserify"),
            path: require.resolve("path-browserify"),
            zlib: require.resolve("browserify-zlib"),
            http: require.resolve("stream-http"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util/"),
            buffer: require.resolve("browserify-buffer"),
            crypto: require.resolve("crypto-browserify"),
            os: require.resolve("os-browserify/browser"),
            constants: require.resolve("constants-browserify"),
            process: require.resolve("process/browser"),
            querystring: require.resolve("querystring-es3"),
            https: require.resolve("https-browserify"),
            tls: false,
            express: false,
            electron: false,
            async_hooks: false,
        });
    }
    return fallback;
}
exports.getFallback = getFallback;
