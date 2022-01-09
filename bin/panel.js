"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const declare_1 = require("./declare");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
class Panel {
    constructor(service, webpackChain) {
        this.service = service;
        this.webpackChain = webpackChain;
    }
    dealPanel(panel, options) {
        const { version } = options;
        let ejsTemplate = '';
        if (version === declare_1.PluginVersion.v3) {
            ejsTemplate = path_1.join(__dirname, '../template/panel-v3.ejs');
        }
        else if (version === declare_1.PluginVersion.v2) {
            ejsTemplate = path_1.join(__dirname, '../template/panel-v2.ejs');
        }
        const mainFile = path_1.join(this.service.context, panel.main);
        if (ejsTemplate && fs_extra_1.existsSync(mainFile)) {
            let { webpackChain } = this;
            const entryName = `panel/${panel.name}`;
            let entryPoint = webpackChain.entryPoints.get(entryName);
            if (entryPoint) {
                console.error(`has same entry ${entryName}`);
            }
            else {
                const hotFile = path_1.join(this.service.root, './src/ccp/client-socket.ts');
                webpackChain.entry(entryName).add(mainFile);
                const filename = `${entryName}_panel.js`;
                webpackChain.plugin('panel').use(html_webpack_plugin_1.default, [{
                        template: ejsTemplate,
                        inject: false,
                        minify: false,
                        hash: false,
                        filename,
                        chunks: ['vendor', entryName],
                        ccPlugin: {
                            template: `<div id="app" style="width:100%;height:100%;display:flex;">${panel.name}</div>`,
                            style: '.body{width:100%}',
                            messages: 'hello message',
                        }
                    }]);
                return `${filename}`;
            }
        }
        return '';
    }
    dealPanels() {
        let panels = this.service.projectConfig.manifest.panels;
        const options = this.service.projectConfig.options;
        if (panels && panels.length) {
            // 主要是处理main的字段
            panels.forEach(panel => {
                // 需要知道这个面板被哪个HTMLWebpack chunk
                panel.main = this.dealPanel(panel, options);
            });
            return panels;
        }
    }
}
exports.default = Panel;
