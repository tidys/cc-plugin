import { PluginApi } from '../plugin-api';
import Config from 'webpack-chain';
import Chain from 'webpack-chain';
import webpack from 'webpack';
import CocosPluginService, { ProjectConfig } from '../service';
import * as Path from 'path';
import { resolve } from 'path';
import { VueLoaderPlugin } from 'vue-loader'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import Panel from '../panel';
import * as Fs from 'fs';
import { existsSync } from 'fs';
import * as FsExtra from 'fs-extra';
import CocosPluginPackageJson from './package.json';
import NpmInstall from '../plugin/npm-install';
import DevServer from '../plugin/dev-server';
import { PluginType } from '../declare';
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import webpackDevSever from 'webpack-dev-server'
import PortFinder from 'portfinder'
import printf from 'printf';
import { log } from '../log'
import requireV3 from '../plugin/require-v3'
import { PluginMgr } from '../plugin-mgr';


function buildTargetNode(service: CocosPluginService) {
    let config = new Chain();
    config.target('node').devtool(false).mode('development').resolve.extensions.add('.ts');
    let cfg = config.toConfig();
    webpack(cfg, (error, status) => {

    });
}

export default class Serve extends PluginApi {
    apply(api: PluginMgr, service: CocosPluginService): void {
        api.registerCommand('serve', {
            description: '开发插件',
        }, (param) => {
            log.blue(printf('%-20s %s', 'service root:    ', service.root))
            log.blue(printf('%-20s %s', 'service context: ', service.context))
            const { options, manifest } = service.projectConfig;
            api.chainWebpack(async (webpackChain: Config) => {
                // 当server开启时，一般来说都需要启用watchBuild，不然没有实际意义
                webpackChain.watch(!!options.watchBuild || options.server?.enabled!)
                webpackChain.mode('development');
                webpackChain.devtool(false);

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
            let webpackConfig = api.resolveChainWebpackConfig();
            const compiler = webpack(webpackConfig, ((err, stats) => {
                if (err) {
                    return console.error(err)
                }
                if (stats?.hasErrors()) {
                    stats?.compilation.errors.forEach(error => {
                        log.yellow(error.message)
                        log.blue(error.details)
                        log.red(error.stack || '')
                    })
                    return console.log('Build failed with error');
                }
                stats?.compilation.emittedAssets.forEach((asset) => {
                    console.log(asset)
                })
                console.log('build complete')
            }));

        })
    }

    async webpackServerTest(compiler: webpack.Compiler) {
        const server = new webpackDevSever({
            // inputFileSystem: FsExtra,
            // outputFileSystem: FsExtra,
            hot: true,
            allowedHosts: ['all']
        }, compiler);
        const host = '0.0.0.0';
        const port = await this.getPort();
        server.listen(port, host, (err) => {
            if (err) {
                return console.log(err)
            }
            console.log(`webpack dev server listen ${port}`)
        })
    }

    async getPort() {
        PortFinder.basePort = 9087;
        const port = await PortFinder.getPortPromise();
        return port;
    }

}
