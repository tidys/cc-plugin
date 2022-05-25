import {PluginApi} from '../plugin-api';
import Config from 'webpack-chain';
import Chain from 'webpack-chain';
import webpack from 'webpack';
import CocosPluginService from '../service';
import * as Path from 'path';
import {CleanWebpackPlugin} from 'clean-webpack-plugin'
import * as Fs from 'fs';
import DevServer from '../plugin/dev-server';
import webpackDevSever from 'webpack-dev-server'
import PortFinder from 'portfinder'
import printf from 'printf';
import {log} from '../log'
import {PluginMgr} from '../plugin-mgr';
import {merge} from 'lodash';

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
        api.registerCommand('serve', {
            description: '开发插件',
        }, async (param) => {
            log.blue(printf('%-20s %s', 'service root:    ', service.root))
            log.blue(printf('%-20s %s', 'service context: ', service.context))
            const { options, manifest } = service.projectConfig;
            api.chainWebpack(async (webpackChain: Config) => {
                // 当server开启时，一般来说都需要启用watchBuild，不然没有实际意义
                webpackChain.watch(!!options.watchBuild || options.server?.enabled!)
                webpackChain.mode('development');
                webpackChain.devtool('source-map');

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
            // https://webpack.docschina.org/configuration/resolve/#resolvefallback
            let fallback: Record<string, string | boolean> = {
                fs: false,
            };
            if (service.isWeb()) {
                // web情况下： net模块重定向
                fallback = Object.assign(fallback, {
                    'assert': require.resolve('assert'),
                    'net': require.resolve('net-browserify'),
                    'path': require.resolve('path-browserify'),
                    'zlib': require.resolve('browserify-zlib'),
                    "http": require.resolve("stream-http"),
                    "stream": require.resolve("stream-browserify"),
                    "util": require.resolve("util/"),
                    "crypto": require.resolve("crypto-browserify"),
                    "os": require.resolve("os-browserify/browser"),
                    "constants": require.resolve("constants-browserify"),
                    "express": false,
                    "electron": false,
                })
            }


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
            if (service.isWeb()) {
                await this.runWebpackServer(compiler);
            }
        })
    }

    async runWebpackServer(compiler: webpack.Compiler) {
        const host = await webpackDevSever.internalIP('v4');
        const port = await PortFinder.getPortPromise();
        const server = new webpackDevSever({
            // inputFileSystem: FsExtra,
            // outputFileSystem: FsExtra,
            hot: false,
            allowedHosts: ['all'],
            open: true,
            host,
            port,
            static: './dist',
        }, compiler);
        server.startCallback((error) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log(`webpack dev server listen ${host}:${port}`)
        });
    }
}
