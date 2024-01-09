"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const declare_1 = require("./declare");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const const_1 = require("./chrome/const");
const log_1 = require("./log");
class Panel {
    constructor(service, webpackChain) {
        this.service = service;
        this.webpackChain = webpackChain;
    }
    getHtmlMinHash() {
        const ret = { min: false, hash: false };
        const { type } = this.service.projectConfig;
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
    dealPanel(panel, pluginOptions) {
        var _a;
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
            if (!fs_extra_1.existsSync(mainFile)) {
                log_1.log.red(`source file ${mainFile} not exist, please check your config file`);
                process.exit(1);
            }
        }
        if (ejsTemplate && fs_extra_1.existsSync(ejsTemplate) && fs_extra_1.existsSync(mainFile)) {
            let { webpackChain } = this;
            let entryName = 'default';
            if (this.service.isWeb() || this.service.isChromePlugin()) {
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
                    let meta = '';
                    if ((_a = pluginOptions.server) === null || _a === void 0 ? void 0 : _a.https) {
                        meta = `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`;
                    }
                    options = Object.assign(options, {
                        ccPlugin: {
                            meta,
                        },
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
    dealChrome() {
        const { chrome } = this.service.projectConfig.manifest;
        if (chrome) {
            // index索引界面
            const panels = [];
            const ejsOptions = JSON.stringify([
                const_1.ChromeConst.html.devtools,
                const_1.ChromeConst.html.options,
                const_1.ChromeConst.html.popup,
            ].map(item => {
                return {
                    label: `${item}`,
                    href: `${item}`,
                };
            }));
            panels.push({
                name: 'index',
                title: "index",
                main: path_1.join(this.service.root, "src/index/index.ts"),
                ejs: path_1.join(this.service.root, "src/index/index.ejs"),
                ejsOptions: { panels: ejsOptions },
                type: declare_1.Panel.Type.InnerIndex,
            });
            // 各个界面
            [
                { name: const_1.ChromeConst.html.devtools, entry: chrome.view_devtools },
                { name: const_1.ChromeConst.html.options, entry: chrome.view_options },
                { name: const_1.ChromeConst.html.popup, entry: chrome.view_popup }
            ].map(item => {
                let name = item.name;
                const suffix = '.html';
                if (name.endsWith(suffix)) {
                    name = name.substring(0, name.length - suffix.length);
                }
                panels.push({
                    name: name,
                    title: name,
                    main: path_1.join(this.service.context, item.entry),
                    ejs: path_1.join(this.service.root, './template/web/index.html'),
                    type: declare_1.Panel.Type.Web,
                });
            });
            const options = this.service.projectConfig.options;
            // 主要是处理main的字段
            panels.forEach(panel => {
                // 需要知道这个面板被哪个HTMLWebpack chunk
                // creator插件需要知道面板对应的js，其他类型不需要
                panel.main = this.dealPanel(panel, options);
            });
            // 单独的脚本
            [
                { name: const_1.ChromeConst.script.content, entry: chrome.script_content },
                { name: const_1.ChromeConst.script.background, entry: chrome.script_background },
                { name: const_1.ChromeConst.script.inject, entry: chrome.script_inject },
            ].map(item => {
                const fullPath = path_1.join(this.service.context, item.entry);
                if (!fs_extra_1.existsSync(fullPath)) {
                    log_1.log.red(`not exist file: ${fullPath}`);
                    process.exit(0);
                }
                const name = path_1.basename(item.name);
                const ext = path_1.extname(item.name);
                const entry = name.substring(0, name.length - ext.length);
                this.webpackChain.entry(entry).add(fullPath);
            });
        }
    }
    dealPanels() {
        let panels = this.service.projectConfig.manifest.panels;
        const options = this.service.projectConfig.options;
        if (panels && panels.length) {
            if (this.service.isWeb()) {
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
            }
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
//# sourceMappingURL=panel.js.map