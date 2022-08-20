import {CocosPluginOptions, PanelOptions, PluginType} from './declare';
import {join} from 'path'
import {existsSync} from 'fs-extra'
import CocosPluginService from './service';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {template} from "lodash";


export default class Panel {
    private service: CocosPluginService;
    private webpackChain: Config;

    constructor(service: CocosPluginService, webpackChain: Config) {
        this.service = service;
        this.webpackChain = webpackChain;
    }

    dealPanel(panel: PanelOptions, options: CocosPluginOptions) {
        let ejsTemplate = null;
        if (this.service.isCreatorPluginV3()) {
            ejsTemplate = join(__dirname, '../template/panel-v3.ejs');
        }
        if (this.service.isCreatorPluginV2()) {
            ejsTemplate = join(__dirname, '../template/panel-v2.ejs');
        }
        if (this.service.isWeb()) {
            ejsTemplate = join(this.service.root, './template/web/index.html');
        }

        const mainFile = join(this.service.context, panel.main);
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
                let options: HtmlWebpackPlugin.Options = {
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
                    })
                } else {
                    options = Object.assign(options, {
                        inject: true,
                        filename: `${entryName}.html`
                    });
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
            // 主要是处理main的字段
            panels.forEach(panel => {
                // 需要知道这个面板被哪个HTMLWebpack chunk
                panel.main = this.dealPanel(panel, options);
            })
            return panels;
        }
    }

}

