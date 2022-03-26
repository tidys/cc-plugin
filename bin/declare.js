"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.DefaultCocosPluginOptions = exports.PluginType = exports.Panel = void 0;
exports.Panel = {
    Type: {
        Dockable: 'dockable',
    },
};
var PluginType;
(function (PluginType) {
    PluginType[PluginType["PluginV2"] = 0] = "PluginV2";
    PluginType[PluginType["PluginV3"] = 1] = "PluginV3";
    PluginType[PluginType["Web"] = 2] = "Web";
    PluginType[PluginType["Electron"] = 3] = "Electron";
    PluginType[PluginType["Vscode"] = 4] = "Vscode";
})(PluginType = exports.PluginType || (exports.PluginType = {}));
// 一些默认值
exports.DefaultCocosPluginOptions = {
    outputProject: './',
    output: './dist',
    type: PluginType.PluginV2,
    server: {
        enabled: false,
        port: 2022,
    },
    watchBuild: false,
    min: false,
};
exports.Platform = {
    WebMobile: 'web-mobile',
    WebDesktop: 'web-desktop',
    Android: 'android',
    Ios: 'ios',
    Mac: 'mac',
    Win32: 'win32',
};
