import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { OptionValues } from 'commander';
import { PluginType } from 'declare';
import * as Fs from 'fs';
import { ServerResponse } from 'http';
import { merge } from 'lodash';
import * as Path from 'path';
import PortFinder from 'portfinder';
import printf from 'printf';
import webpack from 'webpack';
import { default as Chain, default as Config } from 'webpack-chain';
import webpackDevSever, { IncomingMessage, ProxyConfigMap } from 'webpack-dev-server';
import mkcert from 'webpack-mkcert';
import { log } from '../log';
import { PluginApi } from '../plugin-api';
import { PluginMgr } from '../plugin-mgr';
import DevServer from '../plugin/dev-server';
import { cocosPluginService, CocosPluginService } from '../service';
import { checkBuildType, defineVar, getBuildOptions, parseBuildOptions } from './commonOptions';
import { getFallback } from './fallback';
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
            cocosPluginService.dealAssetDb(true);
            const { options, manifest } = service.projectConfig;
            api.chainWebpack(async (webpackChain: Config) => {
                // 当server开启时，一般来说都需要启用watchBuild，不然没有实际意义
                webpackChain.watch(!!options.watchBuild || options.server?.enabled!)
                webpackChain.mode('development');
                // const s: Config.DevTool = options.sourcemap;
                webpackChain.devtool('inline-source-map');
                // 传递变量给项目，用于代码剔除
                parseBuildOptions(webpackChain, type, opts);
                defineVar(webpackChain, true, service.context);
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

            const s = service.projectConfig.options.server;
            if (s && s.enabled) {
                if (service.isWeb() || service.isChromePlugin()) {
                    // chrome模式不需要这个devServer，但是在web上预览view时非常有帮助
                    // 所以需要增加一个开关
                    await this.runWebpackServer(compiler, service);
                }
            }
        })
    }

    async runWebpackServer(compiler: webpack.Compiler, service: CocosPluginService) {
        const { server, staticFileDirectory, staticRequestRedirect } = service.projectConfig.options;
        const host = await webpackDevSever.internalIP('v4');
        const port = await PortFinder.getPortPromise();
        const useHttps = !!(server && server.https)
        let httpOptions: any = useHttps;
        if (useHttps) {
            const { cert, key } = await mkcert({
                source: 'coding',
                hosts: ['localhost', '127.0.0.1', host]
            })
            httpOptions = { cert, key };
        }
        const proxy: ProxyConfigMap = {};
        if (staticRequestRedirect && staticFileDirectory) {
            // 处理xhr请求static的资源
            proxy[staticFileDirectory] = {
                bypass: function (req: IncomingMessage, res: ServerResponse, proxyOptions) {
                    const { url } = req;
                    if (url) {
                        const file = Path.join(service.context, url || "");
                        if (!Fs.existsSync(file)) {
                            return;
                        }
                        const ext = Path.extname(url);
                        let data: any = null;
                        if (['.plist', '.json', '.txt'].includes(ext)) {
                            data = Fs.readFileSync(file, "utf-8")
                        } else if ([".png", '.jpg', '.jpeg'].includes(ext)) {
                            if (false) {
                                // 会导致响应异常，暂时不使用base64了
                                const head: Record<string, string> = {};
                                head['.jpg'] = head['.jpeg'] = `data:image/jpeg;base64,`;
                                head['.png'] = 'data:image/png;base64,';
                                data = Fs.readFileSync(file).toString('base64');
                                data = `${head[ext]}${data}`;
                            } else {
                                data = Fs.readFileSync(file)
                            }
                        } else if ('.wasm' === ext) {
                            res.setHeader('Content-Type', 'application/wasm');
                            data = Fs.readFileSync(file);
                        } else {
                            data = Fs.readFileSync(file);

                        }
                        if (data) {
                            res.end(data)
                        }
                    }
                }
            }
        }
        const webpackDevServerInstance = new webpackDevSever({
            // inputFileSystem: FsExtra,
            // outputFileSystem: FsExtra,
            hot: true,
            allowedHosts: ["all"],
            open: true,
            host: "0.0.0.0",
            https: httpOptions,
            port,
            static: "./dist",
            devMiddleware: {
                //service.isChromePlugin() ? true : false,
                writeToDisk: !!(server && server.writeToDisk),
            },
            proxy,
        }, compiler);
        webpackDevServerInstance.startCallback((error) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log(`webpack dev server listen ${host}:${port}`)
            // showWeChatQrCode();
        });
    }
}
