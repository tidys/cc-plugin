"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const webpack_1 = __importDefault(require("webpack"));
const log_1 = require("../log");
const zip_1 = __importDefault(require("../plugin/zip"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const Path = __importStar(require("path"));
const lodash_1 = require("lodash");
const fallback_1 = require("./fallback");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
class Pack extends plugin_api_1.PluginApi {
    exit() {
        process.exit(0);
    }
    apply(api, service) {
        api.registerCommand('pack', { description: '打包插件' }, (param) => {
            api.chainWebpack((webpackChain) => __awaiter(this, void 0, void 0, function* () {
                webpackChain.mode('production');
                webpackChain.devtool(false);
                webpackChain.optimization.minimizer('TerserPlugin').use(terser_webpack_plugin_1.default, [
                    // @ts-ignore 不输出license.txt
                    {
                        extractComments: false,
                        // @ts-ignore
                        terserOptions: {
                            // @ts-ignore
                            compress: {
                                drop_console: true,
                                drop_debugger: true,
                            }
                        }
                    }
                ]);
                // 修改配置，主要是把server参数关闭了
                webpackChain.module.rule('config-loader')
                    .test(/\.config.ts$/)
                    .use('cc-plugin-config-loader')
                    .loader(Path.join(__dirname, '../plugin/cc-plugin-config.loader.js'))
                    .options({});
                // webpackChain
                //     .plugin('clean')
                //     .use(CleanWebpackPlugin, [{
                //         verbose: true,
                //         cleanStaleWebpackAssets: false,
                //         cleanOnceBeforeBuildPatterns: ['**/*'],
                //     }])
                //     .end();
                webpackChain.plugin('zip').use(zip_1.default, [service]);
            }));
            // clean output results
            const { cleanBeforeBuildWithPack } = service.projectConfig.options;
            if (cleanBeforeBuildWithPack) {
                const { output } = service.projectConfig.options;
                if (output && fs_1.existsSync(output)) {
                    fs_extra_1.emptyDirSync(output);
                    console.log(`clean output:${output}`);
                }
            }
            let webpackConfig = api.resolveChainWebpackConfig();
            let fallback = fallback_1.getFallback(service);
            webpackConfig = lodash_1.merge(webpackConfig, { resolve: { fallback } });
            webpack_1.default(webpackConfig, ((err, stats) => {
                if (err) {
                    return this.exit();
                }
                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                    stats === null || stats === void 0 ? void 0 : stats.compilation.errors.forEach(error => {
                        log_1.log.yellow(error.message);
                        log_1.log.blue(error.details);
                        log_1.log.red(error.stack || '');
                    });
                    return this.exit();
                }
                log_1.log.green('构建成功');
            }));
        });
    }
}
exports.default = Pack;
