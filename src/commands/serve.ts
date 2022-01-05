import { PluginApi } from '../plugin-api';
import Config from 'webpack-chain';
import Chain from 'webpack-chain';
import webpack from 'webpack';
import CocosPluginService, { ProjectConfig } from '../service';
import * as Path from 'path';
import vueLoader, { VueLoaderPlugin } from 'vue-loader'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import Panel from '../panel';
import * as Fs from 'fs';
import { existsSync } from 'fs';
import * as FsExtra from 'fs-extra';
import CocosPluginPackageJson from './cocos-plugin-package.json';
import NpmInstall from '../plugin/npm-install';
import DevServer from '../plugin/dev-server';
import { PluginVersion } from '../declare';
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import webpackDevSever from 'webpack-dev-server'
import PortFinder from 'portfinder'
import chalk from 'chalk';
import printf from 'printf';

function getExternal(dir: string, defaultModules: string[] = []) {
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

    ['vue-loader', 'tdesign-vue-next'].forEach(item => {
        delete map[item];
    });

    return map;
}

function webpackEntry(service: CocosPluginService, webpackChain: Config, entryName: string, file: string, prepend?: string) {
    const mainFile = Path.resolve(service.context, file);
    if (!Fs.existsSync(mainFile)) {
        console.error('main file not exists: ', mainFile);
        process.exit(0);
    }
    let entryPoint: Config.EntryPoint = webpackChain.entry(entryName).add(mainFile);
    if (prepend) {
        entryPoint.prepend(prepend);
    }
}

function buildTargetNode(service: CocosPluginService) {
    let config = new Chain();
    config.target('node').devtool(false).mode('development').resolve.extensions.add('.ts');
    let cfg = config.toConfig();
    webpack(cfg, (error, status) => {

    });
}

export default function (api: PluginApi, projectConfig: ProjectConfig) {
    api.registerCommand('serve', {
        description: 'start development server',
        usage: 'usage',
        options: {}
    }, async (service: CocosPluginService) => {
        console.log(chalk.red(printf('%-20s %s', 'service root:    ', service.root)))
        console.log(chalk.red(printf('%-20s %s', 'service context: ', service.context)))

        api.chainWebpack(async (webpackChain: Config) => {
            webpackChain.watch(!!projectConfig.options.watch)
            webpackChain.mode('development');
            webpackChain.target('node');
            webpackChain.devtool(false);
            const vuePath = Path.resolve(service.root, './node_modules/vue');
            webpackChain.resolve.alias.set('vue', vuePath).end();
            webpackChain.resolve.extensions.add('.ts').add('.vue').add('.js').add('.json');

            // 排除模块
            let externals = getExternal(service.context, ['electron', 'fs-extra', 'express'])
            webpackChain.externals(externals)
            // i18n
            const { i18n_zh, i18n_en } = projectConfig.manifest;
            i18n_zh && webpackEntry(service, webpackChain, 'i18n/zh', i18n_zh);
            i18n_en && webpackEntry(service, webpackChain, 'i18n/en', i18n_en);

            // 主进程代码
            let mainFile = ''
            if (projectConfig.options.version === PluginVersion.v2) {
                mainFile = '/src/ccp/main-v2.ts';
            } else if (projectConfig.options.version === PluginVersion.v3) {
                mainFile = '/src/ccp/main-v3.ts';
            }
            const mainAdaptation = Path.join(service.root, mainFile)
            // 注意先后顺序
            webpackChain.entry('main')
                .add(projectConfig.manifest.main)
                .add(mainAdaptation);


            // out
            let output = projectConfig.options.output!;
            let resolvePath = Path.resolve(service.context, output);
            if (existsSync(resolvePath)) {
                // 处理相对路径
                output = resolvePath;
            }
            const pluginName = projectConfig.manifest.name;
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

            webpackChain.module
                .rule('ts')
                .test(/\.ts(x?)$/)
                .exclude.add(/node_modules/).end()
                .use('ts-loader')
                .loader('ts-loader')
                .options({
                    onlyCompileBundledFiles: true,
                    appendTsSuffixTo: ['\\.vue$'],
                    compilerOptions: {
                        target: "es6",
                        module: "es6",
                        // strict: false,
                        // jsx: "preserve",
                        // importHelpers: true,
                        moduleResolution: "node",
                        skipLibCheck: true,
                        esModuleInterop: true,
                        // allowSyntheticDefaultImports: true,
                        // noImplicitAny: false,
                        // noImplicitThis: false,
                        lib: ['es6', 'dom'],
                    }
                });

            webpackChain.module
                .rule('file')
                .test(/\.(png|jpg|gif|svg|eot|woff|ttf)/)
                .use('file-loader')
                .loader('file-loader');


            // 处理面板
            const panel = new Panel(service, webpackChain);
            panel.dealPanels();

            // plugins
            const port = 2346;//await getPort();
            webpackChain.plugin('dev-server')
                .use(DevServer, [port])
                .end();
            webpackChain.plugin('npm install')
                .use(NpmInstall, [projectConfig.options.output!])
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
            webpackChain
                .plugin('clean')
                .use(CleanWebpackPlugin, [{
                    verbose: true,
                    cleanStaleWebpackAssets: false,
                    cleanOnceBeforeBuildPatterns: ['i18n/**', 'panel/**', 'main.js', 'package-lock.json', 'package.json'],
                }])
                .end();

        });
        let webpackConfig = api.resolveChainWebpackConfig();
        const compiler = webpack(webpackConfig, ((err, stats) => {
            if (err) {
                return console.error(err)
            }
            if (stats?.hasErrors()) {
                stats?.compilation.errors.forEach(error => {
                    console.log(chalk.yellow(error.message))
                    console.log(chalk.blue(error.details))
                    console.log(chalk.red(error.stack || ''))
                })
                return console.log('Build failed with error');
            }
            stats?.compilation.emittedAssets.forEach((asset) => {
                console.log(asset)
            })
            console.log('build complete')
        }));

    })
}

async function getPort() {
    PortFinder.basePort = 9087;
    debugger
    const port = await PortFinder.getPortPromise();
    return port;
}

async function webpackServerTest(compiler: webpack.Compiler) {
    const server = new webpackDevSever({
        // inputFileSystem: FsExtra,
        // outputFileSystem: FsExtra,
        hot: true,
        allowedHosts: ['all']
    }, compiler);
    const host = '0.0.0.0';
    const port = await getPort();
    server.listen(port, host, (err) => {
        if (err) {
            return console.log(err)
        }
        console.log(`webpack dev server listen ${port}`)
    })
}
