import { PluginApi } from '../plugin-api';
import CocosPluginService, { ProjectConfig } from '../service';
import Config from 'webpack-chain';
import webpack from 'webpack'
import { PluginMgr } from '../plugin-mgr';
import { log } from '../log';
import Zip from '../plugin/zip';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin'
import * as Path from 'path';
import { PluginType } from '../declare';
import { merge } from 'lodash';
import { getFallback } from './fallback';

export default class Pack extends PluginApi {
    exit() {
        process.exit(0);
    }

    private getPluginTypeName(type: PluginType) {
        switch (type) {
            case PluginType.PluginV2:
                return 'plugin-v2';
            case PluginType.PluginV3:
                return 'plugin-v3';
            default:
                return '';
        }
    }

    apply(api: PluginMgr, service: CocosPluginService) {
        api.registerCommand('pack',
            { description: '打包插件' },
            (param) => {
                api.chainWebpack(async (webpackChain: Config) => {
                    webpackChain.mode('production')
                    webpackChain.devtool(false);

                    webpackChain.optimization.minimizer('TerserPlugin').use(TerserPlugin, [
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
                    ])

                    // 修改配置，主要是把server参数关闭了
                    webpackChain.module.rule('config-loader')
                        .test(/\.config.ts$/)
                        .use('cc-plugin-config-loader')
                        .loader(Path.join(__dirname, '../plugin/cc-plugin-config.loader.js'))
                        .options({})
                    // webpackChain
                    //     .plugin('clean')
                    //     .use(CleanWebpackPlugin, [{
                    //         verbose: true,
                    //         cleanStaleWebpackAssets: false,
                    //         cleanOnceBeforeBuildPatterns: ['**/*'],
                    //     }])
                    //     .end();

                    let { name, version } = service.projectConfig.manifest;
                    const { type } = service.projectConfig.options;
                    const typeName = this.getPluginTypeName(type!);
                    if (typeName && typeName.length > 0) {
                        name = `${name}_${typeName}`;
                    }
                    const outDir = Path.join(service.context, 'dist');
                    webpackChain.plugin('zip').use(Zip, [name, version, outDir])
                })
                let webpackConfig = api.resolveChainWebpackConfig();
                let fallback = getFallback(service);
                webpackConfig = merge(webpackConfig, { resolve: { fallback } });

                webpack(webpackConfig, ((err, stats) => {
                    if (err) {
                        return this.exit();
                    }
                    if (stats?.hasErrors()) {
                        stats?.compilation.errors.forEach(error => {
                            log.yellow(error.message)
                            log.blue(error.details)
                            log.red(error.stack || '')
                        })
                        return this.exit();
                    }
                    log.green('构建成功')
                }))
            }
        )
    }

}
