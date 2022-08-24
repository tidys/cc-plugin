"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFallback = void 0;
function getFallback(service) {
    // https://webpack.docschina.org/configuration/resolve/#resolvefallback
    let fallback = {
        fs: false,
    };
    if (service.isWeb()) {
        // web情况下： net模块重定向
        fallback = Object.assign(fallback, {
            'assert': require.resolve('assert'),
            'net': require.resolve('net-browserify'),
            'path': require.resolve('path-browserify'),
            'zlib': require.resolve('browserify-zlib'),
            "http": require.resolve("stream-http"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "crypto": require.resolve("crypto-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "constants": require.resolve("constants-browserify"),
            'process': require.resolve('process/browser'),
            'process-nextick-args': require.resolve('browser-next-tick'),
            "express": false,
            "electron": false,
            'async_hooks': false,
        });
    }
    return fallback;
}
exports.getFallback = getFallback;
