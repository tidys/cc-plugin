"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_api_1 = require("../plugin-api");
const webpack_chain_1 = __importDefault(require("webpack-chain"));
const webpack_1 = __importDefault(require("webpack"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const dev_server_1 = __importDefault(require("../plugin/dev-server"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const portfinder_1 = __importDefault(require("portfinder"));
const printf_1 = __importDefault(require("printf"));
const log_1 = require("../log");
const lodash_1 = require("lodash");
function buildTargetNode(service) {
    let config = new webpack_chain_1.default();
    config.target('node').devtool(false).mode('development').resolve.extensions.add('.ts');
    let cfg = config.toConfig();
    webpack_1.default(cfg, (error, status) => {
    });
}
class Serve extends plugin_api_1.PluginApi {
    apply(api, service) {
        api.registerCommand('serve', {
            description: '开发插件',
        }, (param) => {
            log_1.log.blue(printf_1.default('%-20s %s', 'service root:    ', service.root));
            log_1.log.blue(printf_1.default('%-20s %s', 'service context: ', service.context));
            const { options, manifest } = service.projectConfig;
            api.chainWebpack((webpackChain) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // 当server开启时，一般来说都需要启用watchBuild，不然没有实际意义
                webpackChain.watch(!!options.watchBuild || ((_a = options.server) === null || _a === void 0 ? void 0 : _a.enabled));
                webpackChain.mode('development');
                webpackChain.devtool(false);
                webpackChain
                    .plugin('clean')
                    .use(clean_webpack_plugin_1.CleanWebpackPlugin, [{
                        verbose: true,
                        cleanStaleWebpackAssets: false,
                        cleanOnceBeforeBuildPatterns: ['i18n/**', 'panel/**', 'main.js', 'package-lock.json', 'package.json'],
                    }])
                    .end();
                const { enabled, port } = options.server;
                if (enabled) {
                    webpackChain.plugin('dev-server')
                        .use(dev_server_1.default, [port])
                        .end();
                }
            }));
            // https://webpack.docschina.org/configuration/resolve/#resolvefallback
            let fallback = {
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
                });
            }
            let webpackConfig = api.resolveChainWebpackConfig();
            webpackConfig = lodash_1.merge(webpackConfig, { resolve: { fallback } });
            const compiler = webpack_1.default(webpackConfig, ((err, stats) => {
                if (err) {
                    return console.error(err);
                }
                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                    stats === null || stats === void 0 ? void 0 : stats.compilation.errors.forEach(error => {
                        log_1.log.yellow(error.message);
                        log_1.log.blue(error.details);
                        log_1.log.red(error.stack || '');
                    });
                    return console.log('Build failed with error');
                }
                stats === null || stats === void 0 ? void 0 : stats.compilation.emittedAssets.forEach((asset) => {
                    console.log(asset);
                });
                console.log('build complete');
            }));
        });
    }
    webpackServerTest(compiler) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = new webpack_dev_server_1.default({
                // inputFileSystem: FsExtra,
                // outputFileSystem: FsExtra,
                hot: true,
                allowedHosts: ['all']
            }, compiler);
            const host = '0.0.0.0';
            const port = yield this.getPort();
            server.listen(port, host, (err) => {
                if (err) {
                    return console.log(err);
                }
                console.log(`webpack dev server listen ${port}`);
            });
        });
    }
    getPort() {
        return __awaiter(this, void 0, void 0, function* () {
            portfinder_1.default.basePort = 9087;
            const port = yield portfinder_1.default.getPortPromise();
            return port;
        });
    }
}
exports.default = Serve;
