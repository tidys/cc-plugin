import CocosPluginService from '../service';

export function getFallback(service:CocosPluginService){
    // https://webpack.docschina.org/configuration/resolve/#resolvefallback
    let fallback: Record<string, string | boolean> = {
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
        })
    }
    return fallback;
}