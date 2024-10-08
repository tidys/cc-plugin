"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.DefaultCocosPluginOptions = exports.PluginType = exports.Panel = void 0;
exports.Panel = {
    Type: {
        DockAble: 'dockable',
        Simple: 'simple',
        InnerIndex: 'inner-index',
        Web: 'web',
    },
};
var PluginType;
(function (PluginType) {
    PluginType["PluginV2"] = "cp-v2";
    PluginType["PluginV3"] = "cp-v3";
    PluginType["Web"] = "web";
    PluginType["Chrome"] = "chrome";
    PluginType["Electron"] = "electron";
    // Vscode="vscode", // vscode插件
})(PluginType || (exports.PluginType = PluginType = {}));
// 一些默认值
exports.DefaultCocosPluginOptions = {
    outputProject: './',
    output: './dist',
    server: {
        enabled: false,
        port: 2022,
    },
    watchBuild: false,
    min: false,
};
var Platform;
(function (Platform) {
    Platform["Unknown"] = "unknown";
    Platform["WebMobile"] = "web-mobile";
    Platform["WebDesktop"] = "web-desktop";
    Platform["Android"] = "android";
    Platform["Ios"] = "ios";
    Platform["Mac"] = "mac";
    Platform["Win32"] = "win32";
})(Platform || (exports.Platform = Platform = {}));
;
//# sourceMappingURL=declare.js.map