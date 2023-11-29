"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.DefaultCocosPluginOptions = exports.PluginType = exports.Panel = void 0;
exports.Panel = {
    Type: {
        DockAble: "dockable",
        Simple: "simple",
        InnerIndex: "inner-index",
    },
};
var PluginType;
(function (PluginType) {
    PluginType["PluginV2"] = "cp-v2";
    PluginType["PluginV3"] = "cp-v3";
    PluginType["Web"] = "web";
    // Electron="electron", // 桌面应用
    // Vscode="vscode", // vscode插件
})(PluginType = exports.PluginType || (exports.PluginType = {}));
// 一些默认值
exports.DefaultCocosPluginOptions = {
    outputProject: "./",
    output: "./dist",
    server: {
        enabled: false,
        port: 2022,
    },
    watchBuild: false,
    min: false,
};
exports.Platform = {
    WebMobile: "web-mobile",
    WebDesktop: "web-desktop",
    Android: "android",
    Ios: "ios",
    Mac: "mac",
    Win32: "win32",
};
//# sourceMappingURL=declare.js.map