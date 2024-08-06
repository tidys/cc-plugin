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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_api_1 = require("../plugin-api");
const path_1 = __importStar(require("path"));
const fs_1 = __importStar(require("fs"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const css_minimizer_webpack_plugin_1 = __importDefault(require("css-minimizer-webpack-plugin"));
const panel_1 = __importDefault(require("../panel"));
const npm_install_1 = __importDefault(require("../plugin/npm-install"));
const package_json_1 = __importDefault(require("../commands/package.json"));
const chrome_manifest_1 = require("../chrome/chrome-manifest");
const vue_loader_1 = require("vue-loader");
const require_v3_1 = __importDefault(require("../plugin/require-v3"));
const readme_1 = __importDefault(require("../plugin/readme"));
const webpack_1 = __importDefault(require("webpack"));
const log_1 = require("../log");
const FsExtra = __importStar(require("fs-extra"));
// @ts-ignore
const webpack_filter_warnings_plugin_1 = __importDefault(require("webpack-filter-warnings-plugin"));
const const_1 = require("../const");
class Base extends plugin_api_1.PluginApi {
    getExternal(dir, defaultModules = []) {
        let map = {};
        defaultModules.forEach(module => {
            map[module] = '';
        });
        // const nodeModules = Fs.readdirSync(Path.join(dir, 'node_modules'));
        // nodeModules.forEach((module) => {
        //     map[module] = '';
        // })
        const packageFile = path_1.default.join(dir, './package.json');
        if (fs_1.default.existsSync(packageFile)) {
            try {
                const { dependencies } = FsExtra.readJSONSync(packageFile);
                for (let key in dependencies) {
                    if (!key.endsWith('.js')) {
                        map[key] = '';
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        for (let key in map) {
            map[key] = `commonjs ${key}`;
        }
        ['vue-loader'].forEach(item => {
            delete map[item];
        });
        return map;
    }
    webpackEntry(service, webpackChain, entryName, file, prepend) {
        const fileFsPath = path_1.default.resolve(service.context, file);
        if (!fs_1.default.existsSync(fileFsPath)) {
            log_1.log.red(`main file not exists: ${fileFsPath}`);
            process.exit(0);
        }
        let entryPoint = webpackChain.entry(entryName).add(fileFsPath);
        if (prepend) {
            entryPoint.prepend(prepend);
        }
    }
    apply(api, service) {
        api.chainWebpack((webpackChain) => {
            const { options, manifest } = service.projectConfig;
            const pluginName = manifest.name;
            // target
            if (service.isWeb()) {
                webpackChain.target('web');
            }
            else if (service.isCreatorPlugin()) {
                webpackChain.target('node');
            }
            // https://webpack.docschina.org/configuration/resolve#resolvealias
            if (service.isWeb()) {
                const vuePath = path_1.default.resolve(service.root, './node_modules/vue');
                // webpackChain.resolve.alias.set('vue', vuePath).end();
                webpackChain.resolve.alias
                    .set('express', '@xuyanfeng/express-browserify')
                    .set('fs-extra', '@xuyanfeng/fs-extra-browserify')
                    .set('fs', '@xuyanfeng/fs-browserify')
                    .set('globby', '@xuyanfeng/globby-browserify')
                    .set("chokidar", '@xuyanfeng/chokidar-browserify')
                    .end();
            }
            webpackChain.resolve.extensions.add('.ts').add('.vue').add('.js').add('.json').add('.glsl').end();
            // 排除模块 https://webpack.docschina.org/configuration/externals#externals
            if (service.isCreatorPlugin()) {
                let externals = this.getExternal(service.context, ['electron', 'sharp', 'fs-extra', 'express', 'glob']);
                webpackChain.externals(externals);
            }
            if (service.isCreatorPlugin()) {
                // i18n
                const { i18n_zh, i18n_en } = manifest;
                i18n_zh && this.webpackEntry(service, webpackChain, 'i18n/zh', i18n_zh);
                i18n_en && this.webpackEntry(service, webpackChain, 'i18n/en', i18n_en);
                // builder&hooks
                if (service.isCreatorPluginV3()) {
                    const builderEntry = 'builder';
                    const builderFile = path_1.default.resolve(service.root, 'src/ccp/builder/builder.ts');
                    this.webpackEntry(service, webpackChain, builderEntry, builderFile);
                    const hooksEntry = 'hooks';
                    const hooksFile = path_1.default.resolve(service.root, 'src/ccp/builder/hooks.ts');
                    this.webpackEntry(service, webpackChain, hooksEntry, hooksFile);
                }
                // 主进程代码
                let mainFile = '';
                if (service.isCreatorPluginV2()) {
                    mainFile = '/src/ccp/main-v2.ts';
                }
                if (service.isCreatorPluginV3()) {
                    mainFile = '/src/ccp/main-v3.ts';
                }
                const mainAdaptation = path_1.default.join(service.root, mainFile);
                // 注意先后顺序
                webpackChain.entry('main')
                    .add(manifest.main)
                    .add(mainAdaptation);
            }
            // out
            let output = options.output;
            let resolvePath = path_1.default.resolve(service.context, output);
            if ((0, fs_1.existsSync)(resolvePath)) {
                // 处理相对路径
                output = resolvePath;
            }
            if (service.isCreatorPlugin()) {
                webpackChain.output.libraryTarget('commonjs');
                webpackChain.output.publicPath(`packages://${pluginName}/`);
            }
            if (service.isWeb()) {
                webpackChain.output.filename('[name].[fullhash].js');
            }
            else if (service.isCreatorPlugin()) {
                webpackChain.output.filename('[name].js');
            }
            webpackChain.output.path(output);
            // .libraryExport('default') // 这里暂时不能使用这个
            // rules
            webpackChain.module
                .rule('less')
                .test(/\.less$/)
                .use('extract').loader(mini_css_extract_plugin_1.default.loader).end()
                .use('css-loader').loader('css-loader').end()
                .use('less-loader').loader('less-loader').end();
            // .use('postcss-loader').loader('postcss-loader').end();
            webpackChain.module
                .rule('css')
                .test(/\.css$/)
                .use('extract').loader(mini_css_extract_plugin_1.default.loader).end()
                .use('css-loader').loader('css-loader').end();
            // .use('postcss-loader').loader('postcss-loader').end();
            // webpackChain.module
            //     .rule("css-default")
            //     .test(/\.css$/)
            //     .use('style-loader').loader('style-loader').end()
            //     .use('css-loader').loader('css-loader').end();
            webpackChain.module
                .rule('vue')
                .test(/\.vue$/)
                .use('vue-loader')
                .loader('vue-loader')
                .options({
                isServerBuild: false,
                compilerOptions: {
                    isCustomElement(tag) {
                        return /^ui-/i.test(String(tag));
                    },
                }
            }).end();
            const packageSource = (0, path_1.resolve)(service.root, 'src');
            webpackChain.module
                .rule('ts')
                .test(/\.ts(x?)$/)
                .include.add(packageSource).add(service.context).end()
                // .exclude.add(/node_modules/).end()
                .use('ts-loader')
                .loader('ts-loader')
                .options({
                onlyCompileBundledFiles: true,
                appendTsSuffixTo: ['\\.vue$'],
                transpileOnly: true,
                allowTsInNodeModules: true,
                // happyPackMode: true,
                compilerOptions: {
                    target: 'es6',
                    module: 'es6',
                    strict: false,
                    // jsx: "preserve",
                    // importHelpers: true,
                    moduleResolution: 'node',
                    skipLibCheck: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    // noImplicitAny: false,
                    // noImplicitThis: false,
                    lib: ['es6', 'dom'],
                }
            });
            webpackChain.module
                .rule('image')
                .test(/\.(png|jpe?g|gif)$/)
                .use('url-loader')
                .loader('url-loader')
                .options({
                limit: 800 * 1024, // 800k以内都以base64内联
                name: 'images/[name].[ext]'
            });
            // TODO 增加plugin的搜索路径，但是对于glsl-loader没有效果
            webpackChain.resolve.modules
                .add((0, path_1.join)(__dirname, "../plugin"))
                // .add(join(service.context, 'node_modules')) // 优先从当前目录下找，会导致process的问题
                .add("node_modules") // 最后再从全局目录下找
            ;
            // TODO 这里使用的编译后的绝对路径，能用但是不优雅
            webpackChain.module.rule('glsl-loader')
                .test(/\.(glsl)$/)
                .use("glsl-loader")
                .loader((0, path_1.join)(__dirname, "../plugin/glsl-loader.js"));
            webpackChain.module
                .rule('svg')
                .test(/\.(svg)$/)
                .use('svg-url-loader')
                .loader('svg-url-loader')
                .options({
                limit: 800 * 1024, // 800k以内都以base64内联
            });
            webpackChain.module
                .rule('font')
                .test(/\.(ttf|woff2|woff|otf|eot)$/)
                // @ts-ignore
                .type('asset/inline');
            // .use('url-loader')
            // .loader('url-loader')
            // .options({
            //     esModule: false,
            //     fallback: {
            //         loader: 'file-loader',
            //         options: {
            //             name: 'fonts/[name].[ext]'
            //         }
            //     }
            // })
            // 处理面板
            const panel = new panel_1.default(service, webpackChain);
            if (service.isChromePlugin()) {
                panel.dealChrome();
                webpackChain.plugin('chrome-manifest')
                    .use(chrome_manifest_1.ChromeManifest, [service]);
            }
            else {
                panel.dealPanels();
                // plugins
                if (service.isCreatorPlugin()) {
                    webpackChain.plugin('npm install')
                        .use(npm_install_1.default, [options.output]);
                    webpackChain.plugin('cc-plugin-package.json')
                        .use(package_json_1.default, [service]);
                    if (service.isCreatorPluginV3()) {
                        webpackChain.plugin("readme").use(readme_1.default, [service]);
                    }
                }
            }
            webpackChain
                .plugin('vue')
                .use(vue_loader_1.VueLoaderPlugin)
                .end();
            let cssFileName = '[name].css';
            if (service.isWeb()) {
                cssFileName = '[name].[fullhash].css';
            }
            webpackChain.plugin('extract-css')
                .use(mini_css_extract_plugin_1.default, [{
                    filename: cssFileName,
                    chunkFilename: '[id].css'
                }]).end();
            if (service.isCreatorPluginV3()) {
                webpackChain.plugin('require-v3')
                    .use(require_v3_1.default)
                    .end();
            }
            webpackChain.optimization.minimizer("min-css")
                .use(css_minimizer_webpack_plugin_1.default);
            webpackChain
                .plugin('vue_env')
                .use(webpack_1.default.DefinePlugin, [{
                    __VUE_OPTIONS_API__: true,
                    __VUE_PROD_DEVTOOLS__: false
                }]);
            // can't set full process.env
            const { OS, NUMBER_OF_PROCESSORS, LANG, PROCESSOR_LEVEL } = process.env;
            const envCopy = {};
            if (OS)
                envCopy['OS'] = OS;
            if (LANG)
                envCopy['LANG'] = LANG;
            if (PROCESSOR_LEVEL)
                envCopy['PROCESSOR_LEVEL'] = PROCESSOR_LEVEL;
            if (NUMBER_OF_PROCESSORS)
                envCopy['NUMBER_OF_PROCESSORS'] = NUMBER_OF_PROCESSORS;
            webpackChain.plugin("process_define")
                .use(webpack_1.default.DefinePlugin, [{
                    // 这里不能使用'process.env': JSON.stringify({}), 会被替换为{}.Debug, 这个是有语法问题的
                    // 'process.env': {} 替换的结果为 ({}).DEBUG , 是正常的
                    'process.env': {},
                    'process.browser': !!service.isWeb(),
                }]);
            webpackChain
                .plugin('CriticalDependency')
                .use(webpack_filter_warnings_plugin_1.default, [{ exclude: [/Critical dependency/] }]);
            if (service.isWeb() && false) {
                // 预定义全局变量Buffer会导致其他pkg误判环境，暂时屏蔽
                webpackChain.plugin("Buffer").use(webpack_1.default.ProvidePlugin, [{ Buffer: require.resolve("browserify-buffer") }]);
            }
            const userPlugins = service.userWebpackConfig.plugins || [];
            if (userPlugins.length) {
                // webpackChain.plugin('provide-process/browser').use(webpack.ProvidePlugin, [{
                //     process: 'process/browser',
                // }]);
                for (let i = 0; i < userPlugins.length; i++) {
                    const plugin = userPlugins[i];
                    if (plugin) {
                        // @ts-ignore
                        const name = plugin['name'] || plugin.constructor.name || `user-plugin-${i}`;
                        webpackChain.plugin(name).use(plugin);
                    }
                    else {
                        console.warn(`invalid webpack plugin in ${const_1.ConfigTypeScript}`);
                    }
                }
            }
        });
    }
}
exports.default = Base;
//# sourceMappingURL=base.js.map