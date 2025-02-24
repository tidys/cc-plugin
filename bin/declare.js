"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcMsg = exports.Platform = exports.DefaultCocosPluginOptions = exports.PluginType = exports.Panel = void 0;
exports.Panel = {
    Type: {
        /**
         * Creator支持的面板类型
         */
        DockAble: 'dockable',
        /**
         * Creator支持的面板类型
         */
        Simple: 'simple',
        /**
         * 自己实现的，基于electron.BrowserWindow的独立窗口
         *
         * 注意，不能在该面板中调用编辑器的相关API，只能通过ipcRenderer发送到主进程后，由主进程调用编辑器的接口
         */
        Floating: 'floating',
        /**
         * web页面的索引面板
         */
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
var IpcMsg;
(function (IpcMsg) {
    /**
     * 通过Ipc消息获得编辑器的node_modules目录
     */
    IpcMsg["EditorNodeModules"] = "editor-node-modules";
})(IpcMsg || (exports.IpcMsg = IpcMsg = {}));
//# sourceMappingURL=declare.js.map