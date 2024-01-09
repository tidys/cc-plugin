import { CocosPluginOptions, PanelOptions, PluginType, Panel as PanelOptionsType } from './declare';
import { basename, extname, join } from 'path'
import { existsSync, } from 'fs-extra'
import { CocosPluginService } from './service';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { template } from "lodash";
import { ChromeConst } from './chrome/const';
import { log } from './log'

export default class Panel {
    private service: CocosPluginService;
    private webpackChain: Config;

    constructor(service: CocosPluginService, webpackChain: Config) {
        this.service = service;
        this.webpackChain = webpackChain;
    }
    getHtmlMinHash(): { min: boolean, hash: boolean } {
        const ret = { min: false, hash: false }
        const { type } = this.service.projectConfig;
        if (type === PluginType.Web) {
            ret.min = true;
            ret.hash = true;
        } else if (type === PluginType.PluginV2 || type === PluginType.PluginV3) {
            ret.min = false;
            ret.hash = false;
        }
        return ret;
    }
    dealPanel(panel: PanelOptions, pluginOptions: CocosPluginOptions) {
        let ejsTemplate = null;
        if (panel.ejs && existsSync(panel.ejs)) {
            ejsTemplate = panel.ejs;
        } else if (this.service.isCreatorPluginV3()) {
            ejsTemplate = join(__dirname, '../template/panel-v3.ejs');
        } else if (this.service.isCreatorPluginV2()) {
            ejsTemplate = join(__dirname, '../template/panel-v2.ejs');
        } else if (this.service.isWeb()) {
            ejsTemplate = join(this.service.root, './template/web/index.html');
        }

        // let panelMain = panel.main.endsWith(".ts") ? panel.main : `${panel.main}.ts`;
        let mainFile = panel.main;
        if (!existsSync(mainFile)) {
            mainFile = join(this.service.context, panel.main);
            if (!existsSync(mainFile)) {
                log.red(`source file ${mainFile} not exist, please check your config file`);
                process.exit(1);
            }
        }

        if (ejsTemplate && existsSync(ejsTemplate) && existsSync(mainFile)) {
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
            } else {
                const filename = `${entryName}_panel.js`;
                const { min, hash } = this.getHtmlMinHash();
                let options: HtmlWebpackPlugin.Options = {
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
                    })
                } else {
                    let meta = '';
                    if (pluginOptions.server?.https) {
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
                if (panel.type === PanelOptionsType.Type.InnerIndex && panel.ejsOptions) {
                    options = Object.assign(options, panel.ejsOptions);
                }
                const hotFile = join(this.service.root, './src/ccp/client-socket.ts')
                webpackChain.entry(entryName).add(mainFile);
                webpackChain.plugin(entryName).use(HtmlWebpackPlugin, [options]);
                return `${filename}`;
            }
        }
        return '';
    }
    dealChrome() {
        const { chrome } = this.service.projectConfig.manifest;
        if (chrome) {
            // index索引界面
            const panels: PanelOptions[] = [];
            const ejsOptions = JSON.stringify([
                ChromeConst.html.devtools,
                ChromeConst.html.options,
                ChromeConst.html.popup,
            ].map(item => {
                return {
                    label: `${item}`,
                    href: `${item}`,
                };
            }));
            // TODO: 未处理https，不过影响不大
            panels.push({
                name: 'index',
                title: "index",
                main: join(this.service.root, "src/index/index.ts"),
                ejs: join(this.service.root, "src/index/index.ejs"),
                ejsOptions: { panels: ejsOptions },
                type: PanelOptionsType.Type.InnerIndex,
            });

            // 各个界面
            [
                { name: ChromeConst.html.devtools, entry: chrome.view_devtools },
                { name: ChromeConst.html.options, entry: chrome.view_options },
                { name: ChromeConst.html.popup, entry: chrome.view_popup }
            ].map(item => {
                let name = item.name;
                const suffix = '.html'
                if (name.endsWith(suffix)) {
                    name = name.substring(0, name.length - suffix.length);
                }
                panels.push({
                    name: name,
                    title: name,
                    main: join(this.service.context, item.entry),
                    ejs: join(this.service.root, './template/web/index.html'),
                    type: PanelOptionsType.Type.Web,
                })
            });

            const options: CocosPluginOptions = this.service.projectConfig.options;
            // 主要是处理main的字段
            panels.forEach(panel => {
                // 需要知道这个面板被哪个HTMLWebpack chunk
                // creator插件需要知道面板对应的js，其他类型不需要
                panel.main = this.dealPanel(panel, options);
            });
            // 单独的脚本
            [
                { name: ChromeConst.script.content, entry: chrome.script_content },
                { name: ChromeConst.script.background, entry: chrome.script_background },
                { name: ChromeConst.script.inject, entry: chrome.script_inject },
            ].map(item => {
                const fullPath = join(this.service.context, item.entry);
                if (!existsSync(fullPath)) {
                    log.red(`not exist file: ${fullPath}`);
                    process.exit(0);
                }
                const name = basename(item.name);
                const ext = extname(item.name);
                const entry = name.substring(0, name.length - ext.length);
                this.webpackChain.entry(entry).add(fullPath);
            });
        }
    }
    dealPanels() {
        let panels: PanelOptions[] | undefined = this.service.projectConfig.manifest.panels;
        const options: CocosPluginOptions = this.service.projectConfig.options;
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
                    main: join(this.service.root, "src/index/index.ts"),
                    ejs: join(this.service.root, "src/index/index.ejs"),
                    ejsOptions: { panels: optionsPanels },
                    type: PanelOptionsType.Type.InnerIndex,
                })
            }
            // 主要是处理main的字段
            panels.forEach(panel => {
                // 需要知道这个面板被哪个HTMLWebpack chunk
                panel.main = this.dealPanel(panel, options);
            })
            return panels;
        }
    }

}

