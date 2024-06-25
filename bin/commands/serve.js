"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const service_1 = require("../service");
const Path = __importStar(require("path"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const Fs = __importStar(require("fs"));
const dev_server_1 = __importDefault(require("../plugin/dev-server"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const portfinder_1 = __importDefault(require("portfinder"));
const printf_1 = __importDefault(require("printf"));
const log_1 = require("../log");
const lodash_1 = require("lodash");
const fallback_1 = require("./fallback");
const commonOptions_1 = require("./commonOptions");
const webpack_mkcert_1 = __importDefault(require("webpack-mkcert"));
portfinder_1.default.basePort = 9087;
function buildTargetNode(service) {
    let config = new webpack_chain_1.default();
    config.target('node').devtool(false).mode('development').resolve.extensions.add('.ts');
    let cfg = config.toConfig();
    (0, webpack_1.default)(cfg, (error, status) => {
    });
}
class Serve extends plugin_api_1.PluginApi {
    apply(api, service) {
        api.registerCommand('serve', (0, commonOptions_1.getBuildOptions)('开发插件'), (type, opts) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            (0, commonOptions_1.checkBuildType)(type, true);
            service_1.cocosPluginService.init(type);
            log_1.log.blue((0, printf_1.default)('%-20s %s', 'service root:    ', service.root));
            log_1.log.blue((0, printf_1.default)('%-20s %s', 'service context: ', service.context));
            const { output } = service.projectConfig.options;
            if (service.isCreatorPlugin() && output) {
                log_1.log.blue((0, printf_1.default)('%-20s %s', 'plugin dir:      ', output));
            }
            const { options, manifest } = service.projectConfig;
            api.chainWebpack((webpackChain) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                // 当server开启时，一般来说都需要启用watchBuild，不然没有实际意义
                webpackChain.watch(!!options.watchBuild || ((_b = options.server) === null || _b === void 0 ? void 0 : _b.enabled));
                webpackChain.mode('development');
                webpackChain.devtool('source-map');
                // 传递变量给项目，用于代码剔除
                (0, commonOptions_1.parseBuildOptions)(webpackChain, type, opts);
                (0, commonOptions_1.defineVar)(webpackChain, true, service.context);
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
            let fallback = (0, fallback_1.getFallback)(service);
            let webpackConfig = api.resolveChainWebpackConfig();
            // 加载用户自定义的配置
            const file = Path.join(service.context, 'webpack.config.js');
            if (Fs.existsSync(file)) {
                const data = require(file);
                if (data.plugins && data.plugins.length) {
                    webpackConfig.plugins = (_a = webpackConfig.plugins) === null || _a === void 0 ? void 0 : _a.concat(data.plugins);
                }
            }
            webpackConfig = (0, lodash_1.merge)(webpackConfig, { resolve: { fallback } });
            const compiler = (0, webpack_1.default)(webpackConfig, ((err, stats) => {
                if (err) {
                    return console.error(err);
                }
                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                    stats === null || stats === void 0 ? void 0 : stats.compilation.errors.forEach(error => {
                        log_1.log.yellow(error.message);
                        log_1.log.blue(error.details || "");
                        log_1.log.red(error.stack || '');
                    });
                    return console.log('Build failed with error');
                }
                stats === null || stats === void 0 ? void 0 : stats.compilation.emittedAssets.forEach((asset) => {
                    console.log(asset);
                });
                console.log('build complete');
            }));
            const s = service.projectConfig.options.server;
            if (s && s.enabled) {
                if (service.isWeb() || service.isChromePlugin()) {
                    // chrome模式不需要这个devServer，但是在web上预览view时非常有帮助
                    // 所以需要增加一个开关
                    yield this.runWebpackServer(compiler, service);
                }
            }
        }));
    }
    runWebpackServer(compiler, service) {
        return __awaiter(this, void 0, void 0, function* () {
            const { server, staticFileDirectory, staticRequestRedirect } = service.projectConfig.options;
            const host = yield webpack_dev_server_1.default.internalIP('v4');
            const port = yield portfinder_1.default.getPortPromise();
            const useHttps = !!(server && server.https);
            let httpOptions = useHttps;
            if (useHttps) {
                const { cert, key } = yield (0, webpack_mkcert_1.default)({
                    source: 'coding',
                    hosts: ['localhost', '127.0.0.1', host]
                });
                httpOptions = { cert, key };
            }
            const proxy = {};
            if (staticRequestRedirect && staticFileDirectory) {
                // 处理xhr请求static的资源
                proxy[staticFileDirectory] = {
                    bypass: function (req, res, proxyOptions) {
                        const { url } = req;
                        if (url) {
                            const file = Path.join(service.context, url || "");
                            if (!Fs.existsSync(file)) {
                                return;
                            }
                            const ext = Path.extname(url);
                            let data = null;
                            if ('.plist' === ext) {
                                data = Fs.readFileSync(file, "utf-8");
                            }
                            else {
                                data = Fs.readFileSync(file);
                            }
                            if (data) {
                                res.end(data);
                            }
                        }
                    }
                };
            }
            const webpackDevServerInstance = new webpack_dev_server_1.default({
                // inputFileSystem: FsExtra,
                // outputFileSystem: FsExtra,
                hot: true,
                allowedHosts: ["all"],
                open: true,
                host,
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
                console.log(`webpack dev server listen ${host}:${port}`);
                // showWeChatQrCode();
            });
        });
    }
}
exports.default = Serve;
//# sourceMappingURL=serve.js.map