"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
class Panel {
    constructor(service, webpackChain) {
        this.service = service;
        this.webpackChain = webpackChain;
    }
    dealPanel(panel, options) {
        let ejsTemplate = null;
        if (this.service.isCreatorPluginV3()) {
            ejsTemplate = path_1.join(__dirname, '../template/panel-v3.ejs');
        }
        if (this.service.isCreatorPluginV2()) {
            ejsTemplate = path_1.join(__dirname, '../template/panel-v2.ejs');
        }
        if (this.service.isWeb()) {
            ejsTemplate = path_1.join(this.service.root, './template/web/index.html');
        }
        const mainFile = path_1.join(this.service.context, panel.main);
        if (ejsTemplate && fs_extra_1.existsSync(ejsTemplate) && fs_extra_1.existsSync(mainFile)) {
            let { webpackChain } = this;
            let entryName = 'default';
            if (this.service.isWeb()) {
                entryName = panel.name;
            }
            if (this.service.isCreatorPlugin()) {
                entryName = `panel/${panel.name}`;
            }
            let entryPoint = webpackChain.entryPoints.get(entryName);
            if (entryPoint) {
                console.error(`has same entry ${entryName}`);
            }
            else {
                const filename = `${entryName}_panel.js`;
                let options = {
                    template: ejsTemplate,
                    minify: false,
                    hash: false,
                    chunks: ['vendor', entryName],
                };
                // creator插件必须有模板
                if (this.service.isCreatorPlugin()) {
                    options = Object.assign(options, {
                        filename,
                        inject: false,
                        ccPlugin: {
                            template: `<div id="app" style="width:100%;height:100%;display:flex;">${panel.name}</div>`,
                            style: '.body{width:100%}',
                            messages: 'hello message',
                        }
                    });
                }
                else {
                    options = Object.assign(options, {
                        inject: true,
                        filename: `${entryName}.html`
                    });
                }
                const hotFile = path_1.join(this.service.root, './src/ccp/client-socket.ts');
                webpackChain.entry(entryName).add(mainFile);
                webpackChain.plugin('panel').use(html_webpack_plugin_1.default, [options]);
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
