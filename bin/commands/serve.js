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
const webpack_chain_1 = __importDefault(require("webpack-chain"));
const webpack_1 = __importDefault(require("webpack"));
const Path = __importStar(require("path"));
const vue_loader_1 = __importDefault(require("vue-loader"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const panel_1 = __importDefault(require("../panel"));
const Fs = __importStar(require("fs"));
const fs_1 = require("fs");
const cocos_plugin_package_json_1 = __importDefault(require("./cocos-plugin-package.json"));
const npm_install_1 = __importDefault(require("../plugin/npm-install"));
const declare_1 = require("../declare");
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
function getExternal(dir) {
    let map = {};
    const nodeModules = Fs.readdirSync(Path.join(dir, 'node_modules'));
    nodeModules.forEach((module) => {
        map[module] = '';
    });
    const { dependencies } = require('./package.json');
    for (let key in dependencies) {
        map[key] = '';
    }
    for (let key in map) {
        map[key] = `commonjs ${key}`;
    }
    delete map['vue-loader'];
    return map;
}
function webpackEntry(service, webpackChain, entryName, file, prepend) {
    const mainFile = Path.resolve(service.context, file);
    if (!Fs.existsSync(mainFile)) {
        console.error('main file not exists: ', mainFile);
        process.exit(0);
    }
    let entryPoint = webpackChain.entry(entryName).add(mainFile);
    if (prepend) {
        entryPoint.prepend(prepend);
    }
}
function buildTargetNode(service) {
    let config = new webpack_chain_1.default();
    config.target('node').devtool(false).mode('development').resolve.extensions.add('.ts');
    let cfg = config.toConfig();
    (0, webpack_1.default)(cfg, (error, status) => {
    });
}
function default_1(api, projectConfig) {
    api.registerCommand('serve', {
        description: 'start development server',
        usage: 'usage',
        options: {}
    }, (service) => __awaiter(this, void 0, void 0, function* () {
        api.chainWebpack((webpackChain) => {
            webpackChain.mode('development');
            webpackChain.target('node');
            webpackChain.devtool(false);
            webpackChain.resolve.extensions.add('.ts').add('.vue').add('.json');
            // 排除模块
            // webpackChain.externals(getExternal(Path.join(__dirname,'../../')))
            // i18n
            const { i18n_zh, i18n_en } = projectConfig.manifest;
            i18n_zh && webpackEntry(service, webpackChain, 'i18n/zh', i18n_zh);
            i18n_en && webpackEntry(service, webpackChain, 'i18n/en', i18n_en);
            // 主进程代码
            let mainFile = '';
            if (projectConfig.options.version === declare_1.PluginVersion.v2) {
                mainFile = '/src/ccp/main-v2.ts';
            }
            else if (projectConfig.options.version === declare_1.PluginVersion.v3) {
                mainFile = '/src/ccp/main-v3.ts';
            }
            const mainAdaptation = Path.join(service.root, mainFile);
            // 注意先后顺序
            webpackChain.entry('main')
                .add(projectConfig.manifest.main)
                .add(mainAdaptation);
            // out
            let output = projectConfig.options.output;
            let resolvePath = Path.resolve(service.context, output);
            if ((0, fs_1.existsSync)(resolvePath)) {
                // 处理相对路径
                output = resolvePath;
            }
            const pluginName = projectConfig.manifest.name;
            webpackChain.output.path(output)
                .libraryTarget('commonjs')
                .publicPath(`packages://${pluginName}/`);
            // rules
            webpackChain.module
                .rule('less')
                .test(/\.less$/)
                .use('extract').loader(mini_css_extract_plugin_1.default.loader).end()
                .use('css-loader').loader('css-loader').end()
                .use('less-loader').loader('less-loader').end();
            webpackChain.module
                .rule('css')
                .test(/\.css$/)
                .use('extract').loader(mini_css_extract_plugin_1.default.loader).end()
                .use('css-loader').loader('css-loader').end();
            webpackChain.module
                .rule('vue')
                .test(/\.vue$/)
                .use('vue-loader').loader('vue-loader').options({ optimizeSSR: false }).end();
            webpackChain.module
                .rule('ts')
                .test(/\.ts(x?)$/)
                .use('ts-loader')
                .loader('ts-loader')
                .options({
                onlyCompileBundledFiles: true,
                appendTsSuffixTo: [/\.vue$/],
            });
            webpackChain.module
                .rule('file')
                .test(/\.(png|jpg|gif|svg|eot|woff|ttf)/)
                .use('file-loader')
                .loader('file-loader');
            // 处理面板
            const panel = new panel_1.default(service, webpackChain);
            panel.dealPanels();
            // plugins
            webpackChain.plugin('npm install')
                .use(npm_install_1.default, [projectConfig.options.output]);
            webpackChain.plugin('cc-plugin-package.json')
                .use(cocos_plugin_package_json_1.default, [service]);
            webpackChain
                .plugin('vue')
                .use(vue_loader_1.default.VueLoaderPlugin)
                .end();
            webpackChain.plugin('extract-css')
                .use(mini_css_extract_plugin_1.default, [{
                    filename: '[name].css',
                    chunkFilename: '[id].css'
                }]).end();
            webpackChain
                .plugin('clean')
                .use(clean_webpack_plugin_1.CleanWebpackPlugin, [{
                    verbose: true,
                    cleanStaleWebpackAssets: false,
                    cleanOnceBeforeBuildPatterns: ['i18n/**', 'panel/**', 'main.js', 'package-lock.json', 'package.json'],
                }])
                .end();
        });
        let webpackConfig = api.resolveChainWebpackConfig();
        const compiler = (0, webpack_1.default)(webpackConfig, ((err, stats) => {
            if (err) {
                return console.error(err);
            }
            if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                stats === null || stats === void 0 ? void 0 : stats.compilation.errors.forEach(error => {
                    console.log(error.message);
                    console.log(error.stack);
                });
                return console.log('Build failed with error');
            }
            stats === null || stats === void 0 ? void 0 : stats.compilation.emittedAssets.forEach((asset) => {
                console.log(asset);
            });
            console.log('build complete');
        }));
    }));
}
exports.default = default_1;
