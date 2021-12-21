import { PluginApi } from '../plugin-api';
import Config from 'webpack-chain';
import Chain from 'webpack-chain';
import webpack from 'webpack';
import CocosPluginService, { ProjectConfig } from '../service';
import * as Path from 'path';
import vueLoader from 'vue-loader'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import Panel from '../panel';
import * as Fs from 'fs';
import { existsSync } from 'fs';
import CocosPluginPackageJson from './cocos-plugin-package.json';
import NpmInstall from '../plugin/npm-install';
import { PluginVersion } from '../declare';

function getExternal(dir: string) {
    let map: Record<string, string> = {};
    const nodeModules = Fs.readdirSync(Path.join(dir, 'node_modules'));
    nodeModules.forEach((module) => {
        map[module] = '';
    })

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

        api.chainWebpack((webpackChain: Config) => {
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
                .publicPath(`packages://${pluginName}/dist/`)
            // .filename((pathData) => {
            //     return "";
            // })
            ;

            // rules
            webpackChain.module
                .rule('css')
                .test(/\.(less|css)$/)
                .use('style-loader').loader('style-loader').end()
                .use('css-loader').loader('css-loader').end()
                .use('less-loader').loader('less-loader').end();
            webpackChain.module
                .rule('vue')
                .test(/\.vue$/)
                .use('vue-loader').loader('vue-loader');

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
            const panel = new Panel(service, webpackChain);
            panel.dealPanels();

            // plugins
            webpackChain
                .plugin('vue')
                .use(vueLoader.VueLoaderPlugin)
                .end();

            webpackChain
                .plugin('clean')
                .use(CleanWebpackPlugin, [{
                    verbose: true,
                    cleanStaleWebpackAssets: false,
                    cleanOnceBeforeBuildPatterns: ['i18n/**', 'panel/**', 'main.js', 'package-lock.json', 'package.json'],
                }])
                .end();

            webpackChain.plugin('cc-plugin-package.json')
                .use(CocosPluginPackageJson, [service])

            webpackChain.plugin('npm install')
                .use(NpmInstall, [projectConfig.options.output!])
        });
        let webpackConfig = api.resolveChainWebpackConfig();
        const compiler = webpack(webpackConfig, ((err, stats) => {
            if (err) {
                return console.error(err)
            }
            if (stats?.hasErrors()) {
                return console.log('Build failed with error');
            }
            stats?.compilation.emittedAssets.forEach((asset) => {
                console.log(asset)
            })
            console.log('build complete')
        }));


    })
}
