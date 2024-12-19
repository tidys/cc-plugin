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
const service_1 = require("../service");
const webpack_1 = __importDefault(require("webpack"));
const log_1 = require("../log");
const zip_1 = __importDefault(require("../plugin/zip"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const Path = __importStar(require("path"));
const lodash_1 = require("lodash");
const fallback_1 = require("./fallback");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const commonOptions_1 = require("./commonOptions");
class Pack extends plugin_api_1.PluginApi {
    exit() {
        process.exit(0);
    }
    apply(api, service) {
        api.registerCommand('pack', (0, commonOptions_1.getBuildOptions)("打包插件"), (type, options) => {
            (0, commonOptions_1.checkBuildType)(type, true);
            service_1.cocosPluginService.init(type);
            // 打包前，再次清理output目录，可能会清理2次，但是关系不大
            const { output } = service_1.cocosPluginService.projectConfig.options;
            if (output && (0, fs_1.existsSync)(output)) {
                (0, fs_extra_1.emptyDirSync)(output);
                log_1.log.yellow(`清空目录：${output}`);
            }
            service_1.cocosPluginService.dealAssetDb(false);
            api.chainWebpack((webpackChain) => __awaiter(this, void 0, void 0, function* () {
                webpackChain.mode('production');
                webpackChain.devtool(false);
                // 传递变量给项目，用于代码剔除
                (0, commonOptions_1.parseBuildOptions)(webpackChain, type, options);
                (0, commonOptions_1.defineVar)(webpackChain, false);
                webpackChain.optimization.minimizer('TerserPlugin').use(terser_webpack_plugin_1.default, [
                    // @ts-ignore 不输出license.txt
                    {
                        extractComments: false,
                        // @ts-ignore
                        terserOptions: {
                            // @ts-ignore
                            compress: {
                                dead_code: true,
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
                if (output && (0, fs_1.existsSync)(output)) {
                    (0, fs_extra_1.emptyDirSync)(output);
                    console.log(`clean output:${output}`);
                }
            }
            let webpackConfig = api.resolveChainWebpackConfig();
            let fallback = (0, fallback_1.getFallback)(service);
            webpackConfig = (0, lodash_1.merge)(webpackConfig, { resolve: { fallback } });
            (0, webpack_1.default)(webpackConfig, ((err, stats) => {
                if (err) {
                    return this.exit();
                }
                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                    stats === null || stats === void 0 ? void 0 : stats.compilation.errors.forEach(error => {
                        log_1.log.yellow(error.message);
                        log_1.log.blue(error.details || "");
                        log_1.log.red(error.stack || '');
                    });
                    return this.exit();
                }
                this.dealStaticFiles(service);
                log_1.log.green('构建成功');
                // showWeChatQrCode();
            }));
        });
    }
    dealStaticFiles(service) {
        let dir = service.projectConfig.options.staticFileDirectory;
        if (!dir) {
            return;
        }
        if (dir.startsWith('.')) {
            dir = Path.join(service.context, dir);
        }
        if (!(0, fs_1.existsSync)(dir)) {
            log_1.log.yellow(`静态文件目录不存在：${dir}`);
            return;
        }
        const dest = service.projectConfig.options.output;
        if (!dest) {
            log_1.log.yellow(`请配置output目录`);
            return;
        }
        if (!(0, fs_1.existsSync)(dest)) {
            return;
        }
        const base = Path.basename(dir);
        const destDir = Path.join(dest, base);
        (0, fs_extra_1.ensureDirSync)(destDir);
        const filterArray = service.projectConfig.options.staticFileFilter || [];
        const validFilter = [];
        filterArray.map(item => {
            try {
                new RegExp(item);
                validFilter.push(item);
            }
            catch (_a) {
                log_1.log.yellow(`invalid filter reg: ${item}`);
            }
        });
        log_1.log.green(`copy static files: ${dir} => ${dest}`);
        (0, fs_extra_1.copySync)(dir, destDir, {
            overwrite: true,
            filter: (src, dest) => {
                if (!filterArray.length) {
                    return true;
                }
                // if (!statSync(src).isFile()) {
                //     return true;
                // }
                const rel = Path.relative(dir, src).replace(/\\/g, '/');
                if (!rel) {
                    return true;
                }
                for (let i = 0; i < validFilter.length; i++) {
                    const filter = validFilter[i];
                    // .replace(/\\/g, '/');// 正则中也有\转义符，这里不能替换
                    if (new RegExp(filter).test(rel)) {
                        log_1.log.green(`reg [${filter}] filter file: ${rel}`);
                        return false;
                    }
                }
                return true;
            }
        });
        log_1.log.green(`copy static files successful: ${dir} => ${dest}`);
    }
}
exports.default = Pack;
//# sourceMappingURL=pack.js.map