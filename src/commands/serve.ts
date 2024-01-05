import { PluginApi } from '../plugin-api';
import Config from 'webpack-chain';
import Chain from 'webpack-chain';
import webpack from 'webpack';
import { cocosPluginService, CocosPluginService } from '../service';
import * as Path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import * as Fs from 'fs';
import DevServer from '../plugin/dev-server';
import webpackDevSever from 'webpack-dev-server'
import PortFinder from 'portfinder'
import printf from 'printf';
import { log } from '../log'
import { PluginMgr } from '../plugin-mgr';
import { merge } from 'lodash';
import { getFallback } from './fallback';
import { checkBuildType, getBuildOptions, parseBuildOptions } from './commonOptions';
import { OptionValues } from 'commander';
import { PluginType } from 'declare';
import { showWeChatQrCode } from './tool';

PortFinder.basePort = 9087;

function buildTargetNode(service: CocosPluginService) {
    let config = new Chain();
    config.target('node').devtool(false).mode('development').resolve.extensions.add('.ts');
    let cfg = config.toConfig();
    webpack(cfg, (error, status) => {

    });
}

export default class Serve extends PluginApi {
    apply(api: PluginMgr, service: CocosPluginService): void {
        api.registerCommand('serve', getBuildOptions('开发插件'), async (type: string, opts: OptionValues) => {
            checkBuildType(type, true);
            cocosPluginService.init(type as PluginType);
            log.blue(printf('%-20s %s', 'service root:    ', service.root))
            log.blue(printf('%-20s %s', 'service context: ', service.context))
            const { output } = service.projectConfig.options
            if (service.isCreatorPlugin() && output) {
                log.blue(printf('%-20s %s', 'plugin dir:      ', output))
            }
            const { options, manifest } = service.projectConfig;
            api.chainWebpack(async (webpackChain: Config) => {
                // 当server开启时，一般来说都需要启用watchBuild，不然没有实际意义
                webpackChain.watch(!!options.watchBuild || options.server?.enabled!)
                webpackChain.mode('development');
                webpackChain.devtool('source-map');
                // 传递变量给项目，用于代码剔除
                parseBuildOptions(webpackChain, type, opts);
                webpackChain
                    .plugin('clean')
                    .use(CleanWebpackPlugin, [{
                        verbose: true,
                        cleanStaleWebpackAssets: false,
                        cleanOnceBeforeBuildPatterns: ['i18n/**', 'panel/**', 'main.js', 'package-lock.json', 'package.json'],
                    }])
                    .end();

                const { enabled, port } = options.server!;
                if (enabled) {
                    webpackChain.plugin('dev-server')
                        .use(DevServer, [port!])
                        .end();
                }
            });
            let fallback = getFallback(service);


            let webpackConfig = api.resolveChainWebpackConfig();
            // 加载用户自定义的配置
            const file = Path.join(service.context, 'webpack.config.js');
            if (Fs.existsSync(file)) {
                const data = require(file);
                if (data.plugins && data.plugins.length) {
                    webpackConfig.plugins = webpackConfig.plugins?.concat(data.plugins);
                }
            }
            webpackConfig = merge(webpackConfig, { resolve: { fallback } });
            const compiler = webpack(webpackConfig, ((err, stats) => {
                if (err) {
                    return console.error(err)
                }
                if (stats?.hasErrors()) {
                    stats?.compilation.errors.forEach(error => {
                        log.yellow(error.message)
                        log.blue(error.details || "")
                        log.red(error.stack || '')
                    })
                    return console.log('Build failed with error');
                }
                stats?.compilation.emittedAssets.forEach((asset) => {
                    console.log(asset)
                })
                console.log('build complete')
            }));
            if (service.isWeb() || service.isChromePlugin()) {
                // chrome模式不需要这个devServer，但是在web上预览view时非常有帮助
                // 所以需要增加一个开关
                await this.runWebpackServer(compiler, service);
            }
        })
    }

    async runWebpackServer(compiler: webpack.Compiler, service: CocosPluginService) {
        const host = await webpackDevSever.internalIP('v4');
        const port = await PortFinder.getPortPromise();
        const server = new webpackDevSever({
            // inputFileSystem: FsExtra,
            // outputFileSystem: FsExtra,
            hot: true,
            allowedHosts: ["all"],
            open: true,
            host,
            https: true,
            port,
            static: "./dist", 
            devMiddleware: {
                writeToDisk: service.isChromePlugin() ? true : false,
            }
          },
          compiler
        );
        server.startCallback((error) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log(`webpack dev server listen ${host}:${port}`)
            // showWeChatQrCode();
        });
    }
}
