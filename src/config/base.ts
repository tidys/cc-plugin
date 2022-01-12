import { PluginApi } from '../plugin-api';
import CocosPluginService from '../service';
import Chain from 'webpack-chain';
import Config from 'webpack-chain';
import { PluginMgr } from '../plugin-mgr';
import { PluginVersion } from '../declare';
import Path, { resolve } from 'path';
import Fs, { existsSync } from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Panel from '../panel';
import NpmInstall from '../plugin/npm-install';
import CocosPluginPackageJson from '../commands/package.json';
import { VueLoaderPlugin } from 'vue-loader';
import requireV3 from '../plugin/require-v3';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import { log } from '../log';
import * as FsExtra from 'fs-extra';

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
                    map[key] = '';
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

    webpackEntry(service: CocosPluginService, webpackChain: Config, entryName: string, file: string, prepend?: string) {
        const fileFsPath = Path.resolve(service.context, file);
        if (!Fs.existsSync(fileFsPath)) {
            log.red(`main file not exists: ${fileFsPath}`);
            process.exit(0);
        }
        let entryPoint: Config.EntryPoint = webpackChain.entry(entryName).add(fileFsPath);
        if (prepend) {
            entryPoint.prepend(prepend);
        }
    }

    apply(api: PluginMgr, service: CocosPluginService) {
        const { options, manifest } = service.projectConfig;
        api.chainWebpack((webpackChain: Chain) => {
            const { version } = options;
            const pluginName = manifest.name;

            const isV3 = version === PluginVersion.v3;
            const isV2 = version === PluginVersion.v2;

            webpackChain.target('node');
            const vuePath = Path.resolve(service.root, './node_modules/vue');
            // webpackChain.resolve.alias.set('vue', vuePath).end();
            webpackChain.resolve.extensions.add('.ts').add('.vue').add('.js').add('.json');

            // 排除模块
            let externals = this.getExternal(service.context, ['electron', 'fs-extra', 'express'])
            webpackChain.externals(externals)
            // i18n
            const { i18n_zh, i18n_en } = manifest;
            i18n_zh && this.webpackEntry(service, webpackChain, 'i18n/zh', i18n_zh);
            i18n_en && this.webpackEntry(service, webpackChain, 'i18n/en', i18n_en);
            // builder&hooks
            if (isV3) {
                const builderEntry = 'builder';
                const builderFile = Path.resolve(service.root, 'src/ccp/builder/builder.ts')
                this.webpackEntry(service, webpackChain, builderEntry, builderFile);
                const hooksEntry = 'hooks';
                const hooksFile = Path.resolve(service.root, 'src/ccp/builder/hooks.ts');
                this.webpackEntry(service, webpackChain, hooksEntry, hooksFile);
            }
            // 主进程代码
            let mainFile = ''
            if (isV2) {
                mainFile = '/src/ccp/main-v2.ts';
            } else if (isV3) {
                mainFile = '/src/ccp/main-v3.ts';
            }
            const mainAdaptation = Path.join(service.root, mainFile)
            // 注意先后顺序
            webpackChain.entry('main')
                .add(manifest.main)
                .add(mainAdaptation);

            // out
            let output: string = options.output! as string;
            let resolvePath = Path.resolve(service.context, output);
            if (existsSync(resolvePath)) {
                // 处理相对路径
                output = resolvePath;
            }
            // const publicPath = version === PluginVersion.v2 ? `packages://${pluginName}/` : '';
            webpackChain.output.path(output)
                .libraryTarget('commonjs')
                // .libraryExport('default') // 这里暂时不能使用这个
                .publicPath(`packages://${pluginName}/`);
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
                        target: "es6",
                        module: "es6",
                        strict: false,
                        // jsx: "preserve",
                        // importHelpers: true,
                        moduleResolution: "node",
                        skipLibCheck: true,
                        esModuleInterop: true,
                        allowSyntheticDefaultImports: true,
                        // noImplicitAny: false,
                        // noImplicitThis: false,
                        lib: ['es6', 'dom'],
                    }
                });

            // webpackChain.module
            //     .rule('image')
            //     .test(/\.(png|jpe?g|gif|svg)$/)
            //     .use('url-loader')
            //     .loader('url-loader')
            //     .options({
            //         name:'images/[name].[ext]'
            //     })
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
            panel.dealPanels();

            // plugins
            webpackChain.plugin('npm install')
                .use(NpmInstall, [options.output! as string])
            webpackChain.plugin('cc-plugin-package.json')
                .use(CocosPluginPackageJson, [service])
            webpackChain
                .plugin('vue')
                .use(VueLoaderPlugin)
                .end();
            webpackChain.plugin('extract-css')
                .use(MiniCssExtractPlugin, [{
                    filename: '[name].css',
                    chunkFilename: '[id].css'
                }]).end();
            if (isV3) {
                webpackChain.plugin('require-v3')
                    .use(requireV3)
                    .end();
            }
            webpackChain
                .plugin('clean')
                .use(CleanWebpackPlugin, [{
                    verbose: true,
                    cleanStaleWebpackAssets: false,
                    cleanOnceBeforeBuildPatterns: ['i18n/**', 'panel/**', 'main.js', 'package-lock.json', 'package.json'],
                }])
                .end();
            webpackChain
                .plugin('vue_env')
                .use(webpack.DefinePlugin, [{
                    __VUE_OPTIONS_API__: true,
                    __VUE_PROD_DEVTOOLS__: false
                }]);
        })
    }
}
