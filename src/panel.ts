import { CocosPluginOptions, PanelOptions, PluginType, Panel as PanelOptionsType } from './declare';
import { basename, extname, join } from 'path'
import { existsSync, } from 'fs-extra'
import { CocosPluginService } from './service';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { template } from "lodash";
import { ChromeConst } from './chrome/const';
import { log } from './log'
import { Analysis } from './analysis';
import { getValidPanels } from './common';

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
        const templateWeb = join(this.service.root, './template/web/index.html');
        const floating = panel.type === PanelOptionsType.Type.Floating;
        if (panel.ejs && existsSync(panel.ejs)) {
            ejsTemplate = panel.ejs;
        } else if (this.service.isCreatorPluginV3()) {
            if (floating) {
                ejsTemplate = templateWeb;
            } else {
                ejsTemplate = join(__dirname, '../template/panel-v3.ejs');
            }
        } else if (this.service.isCreatorPluginV2()) {
            if (floating) {
                ejsTemplate = templateWeb;
            } else {
                ejsTemplate = join(__dirname, '../template/panel-v2.ejs');
            }
        } else if (this.service.isWeb() || this.service.isElectron()) {
            ejsTemplate = templateWeb;
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
            if (this.service.isCreatorPlugin() || this.service.isElectron()) {
                // entryName和panel.type挂钩，方便判断是否要注入兼容的js逻辑
                entryName = `${panel.type}/${panel.name}`;
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
                if (!floating && this.service.isCreatorPlugin()) {
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
                    let headers = this.getHeaders();
                    if (pluginOptions.server?.https) {
                        headers.push(`<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"/>`);
                    }
                    if (!this.service.isChromePlugin()) {
                        // chrome扩展不允许内联脚本
                        headers.push(`<script>window.__PANEL__=${JSON.stringify(panel)}</script>`);
                    }
                    if (floating) {
                        // FIXME: 不知道为啥，Floating面板没有exports变量，后续有时间再研究
                        headers.push(`<script> var exports = {}; </script>`)
                    }
                    headers = this.filterHead(headers);
                    options = Object.assign(options, {
                        ccPlugin: {
                            headers,
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
    private getHeaders(): string[] {
        let headers: string[] = [];
        // 用户配置的head
        const webHead = this.service.projectConfig.manifest.web?.head || [];
        headers = headers.concat(webHead);
        // 统计鸟的代码
        const analysisCode = new Analysis(this.service)
        let id = this.service.projectConfig.manifest.analysis?.tongjiniao || "";
        if (id) {
            const code = analysisCode.getTongJiNiaoCode(id)
            headers = headers.concat(code);
        }
        // Google Analytics的代码
        const analysis = this.service.projectConfig.manifest.analysis;
        if (analysis && analysis.googleAnalytics) {
            const { measurementID } = analysis.googleAnalytics;
            if (measurementID) {
                const code = analysisCode.getGoogleAnalyticsCode(measurementID)
                headers = headers.concat(code);
            }
        }
        return headers;
    }
    // 过滤无效的head
    private filterHead(headers: string[]) {
        headers = headers.filter(item => {
            item = item.trim();
            if (!item) {
                return false;
            }
            // 检查是否符合xml标签格式
            // <meta />
            const reg1 = new RegExp(/^<.*\/>$/)
            if (reg1.test(item)) {
                return true;
            }
            const reg2 = new RegExp(/^<.*>.*<.*\/.*>$/)
            if (reg2.test(item)) {
                return true;
            }
            log.red(`invalid header: ${item}`);
            return false;
        });
        return headers;
    }
    dealChrome() {
        const { chrome } = this.service.projectConfig.manifest;
        if (chrome) {
            // index索引界面
            const panels: PanelOptions[] = [];
            const indexView = [ChromeConst.html.devtools, ChromeConst.html.options, ChromeConst.html.popup,];
            if (chrome.script_inject_view) {
                indexView.push(ChromeConst.html.inject_view);
            }
            const opts = indexView.map(item => {
                return { label: `${item}`, href: `${item}`, };
            })
            const ejsOptions = JSON.stringify(opts);
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
            const views: Array<{ name: string, entry: string }> = []
            if (chrome.view_devtools) {
                views.push({ name: ChromeConst.html.devtools, entry: chrome.view_devtools })
            }
            if (chrome.view_options) {
                views.push({ name: ChromeConst.html.options, entry: chrome.view_options })
            }
            if (chrome.view_popup) {
                views.push({ name: ChromeConst.html.popup, entry: chrome.view_popup })
            }
            if (chrome.script_inject_view) {
                views.push({
                    name: ChromeConst.html.inject_view,
                    entry: chrome.script_inject_view,
                })
            }
            views.map(item => {
                let name = item.name;
                const suffix = '.html'
                if (name.endsWith(suffix)) {
                    name = name.substring(0, name.length - suffix.length);
                }
                panels.push({
                    name: name,
                    title: name,
                    main: join(this.service.context, item.entry!),
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
                if (!item.entry) {
                    return;
                }
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
        let panels: PanelOptions[] | undefined = getValidPanels(this.service.projectConfig.manifest.panels);
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
                    valid: true,
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

