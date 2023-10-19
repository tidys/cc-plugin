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
    getHtmlMinHash() {
        const ret = { min: false, hash: false };
        const { type } = this.service.projectConfig.options;
        if (type === declare_1.PluginType.Web) {
            ret.min = true;
            ret.hash = true;
        }
        else if (type === declare_1.PluginType.PluginV2 || type === declare_1.PluginType.PluginV3) {
            ret.min = false;
            ret.hash = false;
        }
        return ret;
    }
    dealPanel(panel, options) {
        let ejsTemplate = null;
        if (panel.ejs && fs_extra_1.existsSync(panel.ejs)) {
            ejsTemplate = panel.ejs;
        }
        else if (this.service.isCreatorPluginV3()) {
            ejsTemplate = path_1.join(__dirname, '../template/panel-v3.ejs');
        }
        else if (this.service.isCreatorPluginV2()) {
            ejsTemplate = path_1.join(__dirname, '../template/panel-v2.ejs');
        }
        else if (this.service.isWeb()) {
            ejsTemplate = path_1.join(this.service.root, './template/web/index.html');
        }
        // let panelMain = panel.main.endsWith(".ts") ? panel.main : `${panel.main}.ts`;
        let mainFile = panel.main;
        if (!fs_extra_1.existsSync(mainFile)) {
            mainFile = path_1.join(this.service.context, panel.main);
        }
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
                const { min, hash } = this.getHtmlMinHash();
                let options = {
                    title: panel.title || panel.name,
                    template: ejsTemplate,
                    minify: min,
                    hash: hash,
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
                if (panel.type === declare_1.Panel.Type.InnerIndex && panel.ejsOptions) {
                    options = Object.assign(options, panel.ejsOptions);
                }
                const hotFile = path_1.join(this.service.root, './src/ccp/client-socket.ts');
                webpackChain.entry(entryName).add(mainFile);
                webpackChain.plugin(entryName).use(html_webpack_plugin_1.default, [options]);
                return `${filename}`;
            }
        }
        return '';
    }
    dealPanels() {
        let panels = this.service.projectConfig.manifest.panels;
        const options = this.service.projectConfig.options;
        if (panels && panels.length) {
            // 追加一个index页面，方便运行起来后，查看有多少个panel，也方便用户跳转
            const optionsPanels = JSON.stringify(panels.map((panel) => {
                return {
                    label: `${panel.title}-${panel.name}`,
                    href: `${panel.name}.html`,
                };
            }));
            panels.push({
                name: 'index',
                title: "index",
                main: path_1.join(this.service.root, "src/index/index.ts"),
                ejs: path_1.join(this.service.root, "src/index/index.ejs"),
                ejsOptions: { panels: optionsPanels },
                type: declare_1.Panel.Type.InnerIndex,
            });
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
