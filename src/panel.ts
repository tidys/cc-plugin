import { CocosPluginOptions, PanelOptions, PluginVersion } from './declare';
import { join } from 'path'
import { existsSync } from 'fs-extra'
import CocosPluginService from './service';
import Config from 'webpack-chain';
import HtmlWebpackPlugin from 'html-webpack-plugin';


export default class Panel {
    private service: CocosPluginService;
    private webpackChain: Config;

    constructor(service: CocosPluginService, webpackChain: Config) {
        this.service = service;
        this.webpackChain = webpackChain;
    }

    dealPanel(panel: PanelOptions, options: CocosPluginOptions) {
        const { version } = options;
        let ejsTemplate = '';
        if (version === PluginVersion.v3) {
            ejsTemplate = join(__dirname, '../template/panel-v3.ejs');
        } else if (version === PluginVersion.v2) {
            ejsTemplate = join(__dirname, '../template/panel-v2.ejs');
        }

        const mainFile = join(this.service.context, panel.main);
        if (ejsTemplate && existsSync(mainFile)) {
            let { webpackChain } = this;
            const entryName = `panel/${panel.name}`;
            let entryPoint = webpackChain.entryPoints.get(entryName);
            if (entryPoint) {
                console.error(`has same entry ${entryName}`);
            } else {
                const hotFile = join(this.service.root, './src/ccp/client-socket.ts')
                webpackChain.entry(entryName).add(mainFile);
                const filename = `${entryName}_panel.js`
                webpackChain.plugin('panel').use(HtmlWebpackPlugin, [{
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

