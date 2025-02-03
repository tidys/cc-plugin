import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import Fs, { existsSync } from 'fs';
import * as FsExtra from 'fs-extra';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Path, { join, resolve } from 'path';
import { VueLoaderPlugin } from 'vue-loader';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { ChromeManifest } from '../chrome/chrome-manifest';
import CocosPluginPackageJson from '../commands/package.json';
import { PluginType } from '../declare';
import { log } from '../log';
import Panel from '../panel';
import { PluginApi } from '../plugin-api';
import { PluginMgr } from '../plugin-mgr';
import NpmInstall from '../plugin/npm-install';
import Readme from '../plugin/readme';
import requireV3 from '../plugin/require-v3';
import { CocosPluginService } from '../service';
// @ts-ignore
import filter from 'webpack-filter-warnings-plugin';
import { ConfigTypeScript } from '../const';
import { ElectronPackageJson } from '../electron/package_json';

export default class Base extends PluginApi {
    getExternal(dir: string, defaultModules: string[] = []) {
        let map: Record<string, string> = {};
        defaultModules.forEach(module => {
            map[module] = '';
        })
        // const nodeModules = Fs.readdirSync(Path.join(dir, 'node_modules'));
        // nodeModules.forEach((module) => {
        //     map[module] = '';
        // })
        const packageFile = Path.join(dir, './package.json')
        if (Fs.existsSync(packageFile)) {
            try {
                const { dependencies } = FsExtra.readJSONSync(packageFile);
                for (let key in dependencies) {
                    if (!key.endsWith('.js')) {
                        map[key] = '';
                    }
                }
            } catch (e) {
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

    webpackEntry(service: CocosPluginService, webpackChain: WebpackChain, entryName: string, file: string, prepend?: string) {
        const fileFsPath = Path.resolve(service.context, file);
        if (!Fs.existsSync(fileFsPath)) {
            log.red(`main file not exists: ${fileFsPath}`);
            process.exit(0);
        }
        let entryPoint: WebpackChain.EntryPoint = webpackChain.entry(entryName).add(fileFsPath);
        if (prepend) {
            entryPoint.prepend(prepend);
        }
    }

    apply(api: PluginMgr, service: CocosPluginService) {
        api.chainWebpack((webpackChain: WebpackChain) => {
            const { options, manifest } = service.projectConfig;
            const pluginName = manifest.name;
            // target
            if (service.isWeb() || service.isChromePlugin()) {
                webpackChain.target('web');
            } else if (service.isCreatorPlugin()) {
                webpackChain.target('node');
            } else if (service.isElectron()) {
                webpackChain.target("electron-renderer")
            }
            // https://webpack.docschina.org/configuration/resolve#resolvealias
            if (service.isWeb() || service.isChromePlugin()) {
                const vuePath = Path.resolve(service.root, './node_modules/vue');
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
            if (service.isCreatorPlugin() || service.isElectron()) {
                let externals = this.getExternal(service.context, ['electron', 'sharp', 'fs-extra', 'express', 'glob'])
                webpackChain.externals(externals)
            }
            if (service.isCreatorPlugin()) {
                // i18n
                const { i18n_zh, i18n_en } = manifest;
                i18n_zh && this.webpackEntry(service, webpackChain, 'i18n/zh', i18n_zh);
                i18n_en && this.webpackEntry(service, webpackChain, 'i18n/en', i18n_en);
                // builder&hooks
                if (service.isCreatorPluginV3()) {
                    const builderEntry = 'builder';
                    const builderFile = Path.resolve(service.root, 'src/ccp/builder/builder.ts')
                    this.webpackEntry(service, webpackChain, builderEntry, builderFile);
                    const hooksEntry = 'hooks';
                    const hooksFile = Path.resolve(service.root, 'src/ccp/builder/hooks.ts');
                    this.webpackEntry(service, webpackChain, hooksEntry, hooksFile);
                }
                // 主进程代码
                let mainFile = ''
                if (service.isCreatorPluginV2()) {
                    mainFile = '/src/ccp/main-v2.ts';
                }
                if (service.isCreatorPluginV3()) {
                    mainFile = '/src/ccp/main-v3.ts';
                }
                const mainAdaptation = Path.join(service.root, mainFile)
                // 注意先后顺序
                webpackChain.entry('main')
                    .add(manifest.main)
                    .add(mainAdaptation);
            } else if (service.isElectron()) {
                const mainAdaptation = Path.join(service.root, "src/ccp/main-electron.ts")
                webpackChain.entry("main")
                    .add(manifest.main)
                    .add(mainAdaptation);
            }

            // out
            let output: string = options.output! as string;
            let resolvePath = Path.resolve(service.context, output);
            if (existsSync(resolvePath)) {
                // 处理相对路径
                output = resolvePath;
            }
            if (service.isCreatorPlugin()) {
                webpackChain.output.libraryTarget('commonjs');
                webpackChain.output.publicPath(`packages://${pluginName}/`);
            }
            if (service.isWeb()) {
                webpackChain.output.filename('[name].[fullhash].js')
            } else if (service.isCreatorPlugin()) {
                webpackChain.output.filename('[name].js')
            } else {
                webpackChain.output.filename('[name].js')
            }
            webpackChain.output.path(output)
            // .libraryExport('default') // 这里暂时不能使用这个

            // rules
            webpackChain.module
                .rule('less')
                .test(/\.less$/)
                .use('extract').loader(MiniCssExtractPlugin.loader).end()
                .use('css-loader').loader('css-loader').end()
                .use('less-loader').loader('less-loader').end()
            // .use('postcss-loader').loader('postcss-loader').end();

            webpackChain.module
                .rule('css')
                .test(/\.css$/)
                .use('extract').loader(MiniCssExtractPlugin.loader).end()
                .use('css-loader').loader('css-loader').end()
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
                        isCustomElement(tag: any) {
                            return /^ui-/i.test(String(tag));
                        },
                    }
                }).end();

            const packageSource = resolve(service.root, 'src');
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
                .test(/\.(png|jpe?g|gif|webp|mp4)$/)
                .use('url-loader')
                .loader('url-loader')
                .options({
                    limit: 800 * 1024,// 800k以内都以base64内联
                    name: 'images/[name].[ext]'
                });
            // TODO 增加plugin的搜索路径，但是对于glsl-loader没有效果

            webpackChain.resolve.modules
                .add(join(__dirname, "../plugin"))
                // .add(join(service.context, 'node_modules')) // 优先从当前目录下找，会导致process的问题
                .add("node_modules") // 最后再从全局目录下找
                ;
            // TODO 这里使用的编译后的绝对路径，能用但是不优雅
            webpackChain.module.rule('glsl-loader')
                .test(/\.(glsl)$/)
                .use("glsl-loader")
                .loader(join(__dirname, "../plugin/glsl-loader.js"))
            webpackChain.module
                .rule('svg')
                .test(/\.(svg)$/)
                .use('svg-url-loader')
                .loader('svg-url-loader')
                .options({
                    limit: 800 * 1024,// 800k以内都以base64内联
                })
            webpackChain.module
                .rule('font')
                .test(/\.(ttf|woff2|woff|otf|eot)$/)
                // @ts-ignore
                .type('asset/inline')
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
            const panel = new Panel(service, webpackChain);
            if (service.isChromePlugin()) {
                panel.dealChrome();
                webpackChain.plugin('chrome-manifest')
                    .use(ChromeManifest, [service]);
            } else {
                panel.dealPanels();
                // plugins
                if (service.isCreatorPlugin()) {
                    webpackChain.plugin('npm install')
                        .use(NpmInstall, [options.output! as string])
                    webpackChain.plugin('cc-plugin-package.json')
                        .use(CocosPluginPackageJson, [service])

                    if (service.isCreatorPluginV3()) {
                        webpackChain.plugin("readme").use(Readme, [service])
                    }
                }
            }
            if (service.isElectron()) {
                webpackChain.plugin("electron-pkg-json")
                    .use(ElectronPackageJson, [service])
            }
            webpackChain
                .plugin('vue')
                .use(VueLoaderPlugin)
                .end();
            let cssFileName = '[name].css'
            if (service.isWeb()) {
                cssFileName = '[name].[fullhash].css'
            }
            webpackChain.plugin('extract-css')
                .use(MiniCssExtractPlugin, [{
                    filename: cssFileName,
                    chunkFilename: '[id].css'
                }]).end();
            if (service.isCreatorPluginV3()) {
                webpackChain.plugin('require-v3')
                    .use(requireV3)
                    .end();
            }
            webpackChain.optimization.minimizer("min-css")
                .use(CssMinimizerPlugin);
            webpackChain
                .plugin('vue_env')
                .use(webpack.DefinePlugin, [{
                    __VUE_OPTIONS_API__: true,
                    __VUE_PROD_DEVTOOLS__: false
                }]);
            // can't set full process.env
            const { OS, NUMBER_OF_PROCESSORS, LANG, PROCESSOR_LEVEL } = process.env;
            const envCopy: Record<string, any> = {};
            if (OS) envCopy['OS'] = OS
            if (LANG) envCopy['LANG'] = LANG
            if (PROCESSOR_LEVEL) envCopy['PROCESSOR_LEVEL'] = PROCESSOR_LEVEL
            if (NUMBER_OF_PROCESSORS) envCopy['NUMBER_OF_PROCESSORS'] = NUMBER_OF_PROCESSORS;
            webpackChain.plugin("process_define")
                .use(webpack.DefinePlugin, [{
                    // 这里不能使用'process.env': JSON.stringify({}), 会被替换为{}.Debug, 这个是有语法问题的
                    // 'process.env': {} 替换的结果为 ({}).DEBUG , 是正常的
                    'process.env': {},
                    'process.browser': !!service.isWeb(),
                }]);
            webpackChain
                .plugin('CriticalDependency')
                .use(filter, [{ exclude: [/Critical dependency/] }])

            if (service.isWeb() && false) {
                // 预定义全局变量Buffer会导致其他pkg误判环境，暂时屏蔽
                webpackChain.plugin("Buffer").use(
                    webpack.ProvidePlugin,
                    [{ Buffer: require.resolve("browserify-buffer") }]
                )
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
                    } else {
                        console.warn(`invalid webpack plugin in ${ConfigTypeScript}`);
                    }
                }
            }
        })
    }
}
