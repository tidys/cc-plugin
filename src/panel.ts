import { CocosPluginOptions, PanelOptions, PluginVersion } from './declare';
import { extname, join } from 'path'
import { existsSync, readFileSync } from 'fs-extra'
import CocosPluginService from './service';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as Path from 'path';

const EJSTemplate = join(__dirname, '../template/panel-v2.ejs');


export default class Panel {
    private service: CocosPluginService;
    private webpackChain: Config;

    constructor(service: CocosPluginService, webpackChain: Config) {
        this.service = service;
        this.webpackChain = webpackChain;
    }

    dealPanel(panel: PanelOptions, options: CocosPluginOptions) {
        const mainFile = join(this.service.context, panel.main);
        if (existsSync(mainFile)) {
            let { webpackChain } = this;
            const entryName = `panel/${panel.name}`;
            let entryPoint = webpackChain.entryPoints.get(entryName);
            if (entryPoint) {
                console.error(`has same entry ${entryName}`);
            } else {
                webpackChain.entry(entryName).add(mainFile);
                const filename = `${entryName}_panel.js`
                webpackChain.plugin('panel').use(HtmlWebpackPlugin, [{
                    template: EJSTemplate,
                    inject: false,
                    minify: false,
                    hash: false,
                    filename,
                    chunks: [entryName],
                    ccPlugin: {
                        template: '<div id="app"></div>',
                        style: '.body{width:100%}',
                        messages: 'hello message',
                    }
                }]);
                // const output = this.service.projectConfig.options.output;
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
            if (options.version === PluginVersion.v2) {
                panels.forEach(panel => {
                    // 需要知道这个面板被哪个HTMLWebpack chunk
                    panel.main = this.dealPanel(panel, options);
                })
            }
            return panels;
        }
    }

}

