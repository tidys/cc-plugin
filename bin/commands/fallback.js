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
            "express": false,
            "electron": false,
        });
    }
    return fallback;
}
exports.getFallback = getFallback;
