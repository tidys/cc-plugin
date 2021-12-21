"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginApi = void 0;
const webpack_chain_1 = __importDefault(require("webpack-chain"));
class PluginApi {
    constructor(id, service) {
        this.id = id;
        this.service = service;
    }
    registerCommand(name, opts, fn) {
        if (typeof opts === 'function') {
            fn = opts;
            opts = {};
        }
        this.service.commands[name] = { fn, opts: opts };
    }
    chainWebpack(fn) {
        this.service.webpackChainFns.push(fn);
    }
    resolveChainWebpackConfig() {
        const config = new webpack_chain_1.default();
        this.service.webpackChainFns.forEach(fn => {
            fn(config);
        });
        return config.toConfig();
    }
}
exports.PluginApi = PluginApi;
