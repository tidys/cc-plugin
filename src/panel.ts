import { CocosPluginOptions, PanelOptions, PluginType, Panel as PanelOptionsType } from './declare';
import { join } from 'path'
import { existsSync } from 'fs-extra'
import CocosPluginService from './service';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { template } from "lodash";


export default class Panel {
    private service: CocosPluginService;
    private webpackChain: Config;

    constructor(service: CocosPluginService, webpackChain: Config) {
        this.service = service;
        this.webpackChain = webpackChain;
    }
    getHtmlMinHash(): { min: boolean, hash: boolean } {
        const ret = { min: false, hash: false }
        const { type } = this.service.projectConfig.options;
        if (type === PluginType.Web) {
            ret.min = true;
            ret.hash = true;
        } else if (type === PluginType.PluginV2 || type === PluginType.PluginV3) {
            ret.min = false;
            ret.hash = false;
        }
        return ret;
    }
    dealPanel(panel: PanelOptions, options: CocosPluginOptions) {
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
        }


        if (ejsTemplate && existsSync(ejsTemplate) && existsSync(mainFile)) {
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
                    options = Object.assign(options, {
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

