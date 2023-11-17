"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginMgr = void 0;
const webpack_chain_1 = __importDefault(require("webpack-chain"));
const commander_1 = require("commander");
class PluginMgr {
    constructor(service) {
        this.service = service;
        this.commander = commander_1.program;
    }
    registerCommand(name, opts, callback) {
        let cmd = this.commander
            .command(name)
            .description(opts.description || '');
        if (opts.arguments) {
            opts.arguments.forEach(opt => {
                const arg = new commander_1.Argument(opt.name, opt.desc || opt.name);
                arg.required = !!opt.required;
                arg.argParser;
                arg.default(opt.value);
                cmd.addArgument(arg);
            });
        }
        cmd.action((...args) => {
            // 把参数传递进去
            callback(args);
        });
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
exports.PluginMgr = PluginMgr;
