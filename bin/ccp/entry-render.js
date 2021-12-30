"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosCreatorPluginRender = void 0;
const client_socket_1 = __importDefault(require("./client-socket"));
const panel_1 = require("./panel");
const index_1 = require("./index");
class CocosCreatorPluginRender {
    constructor() {
        this.manifest = null;
        this.options = null;
        this.Panel = new panel_1.Panel();
    }
    init(config, options) {
        var _a;
        this.Panel.setConfig(config);
        this.manifest = config.manifest;
        this.options = config.options;
        // hot
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.hot) {
            let hot = () => {
                let client = new client_socket_1.default();
                client.setReloadCallback(() => {
                    // TODO 渲染进程HMR实现
                    window.location.reload();
                });
                client.connect(index_1.Port);
            };
            const originReady = options.ready || (() => { });
            options.ready = (rootElement, args) => {
                hot();
                originReady(rootElement, args);
            };
        }
        return options;
    }
}
exports.CocosCreatorPluginRender = CocosCreatorPluginRender;
const CCP = new CocosCreatorPluginRender();
exports.default = CCP;
