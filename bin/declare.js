"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCocosPluginOptions = exports.PluginVersion = exports.Panel = void 0;
exports.Panel = {
    Type: {
        Dockable: 'dockable',
    },
};
var PluginVersion;
(function (PluginVersion) {
    PluginVersion[PluginVersion["v2"] = 0] = "v2";
    PluginVersion[PluginVersion["v3"] = 1] = "v3";
})(PluginVersion = exports.PluginVersion || (exports.PluginVersion = {}));
// 一些默认值
exports.DefaultCocosPluginOptions = {
    outputProject: './',
    output: './dist',
    version: PluginVersion.v2,
    server: {
        enabled: false,
        port: 2022,
    },
    watchBuild: false,
    min: false,
};
