import { PluginApi } from '../plugin-api';
import { ProjectConfig, CocosPluginService, cocosPluginService } from '../service';
import Config from 'webpack-chain';
import webpack, { cache } from 'webpack'
import { PluginMgr } from '../plugin-mgr';
import { log } from '../log';
import Zip from '../plugin/zip';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin'
import * as Path from 'path';
import { PluginType } from '../declare';
import { merge } from 'lodash';
import { getFallback } from './fallback';
import { existsSync } from 'fs';
import { emptyDirSync } from 'fs-extra';
import { Option, OptionValues } from 'commander';
import { checkBuildType, getBuildOptions, parseBuildOptions } from './commonOptions';
import { showWeChatQrCode } from './tool';

export default class Pack extends PluginApi {
    exit() {
        process.exit(0);
    }

    apply(api: PluginMgr, service: CocosPluginService) {
        api.registerCommand('pack', getBuildOptions("打包插件"),
            (type, options: OptionValues) => {
                checkBuildType(type, true);
                cocosPluginService.init(type as PluginType);
                // 打包前，再次清理output目录，可能会清理2次，但是关系不大
                const { output } = cocosPluginService.projectConfig.options;
                if (output && existsSync(output)) {
                    emptyDirSync(output);
                    log.yellow(`清空目录：${output}`);
                }

                api.chainWebpack(async (webpackChain: Config) => {
                    webpackChain.mode('production')
                    webpackChain.devtool(false);
                    // 传递变量给项目，用于代码剔除
                    parseBuildOptions(webpackChain, type, options);
                    webpackChain.optimization.minimizer('TerserPlugin').use(TerserPlugin, [
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

                    webpackChain.plugin('zip').use(Zip, [service])
                })

                // clean output results
                const { cleanBeforeBuildWithPack } = service.projectConfig.options;
                if (cleanBeforeBuildWithPack) {
                    const { output } = service.projectConfig.options;
                    if (output && existsSync(output)) {
                        emptyDirSync(output)
                        console.log(`clean output:${output}`)
                    }
                }

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
                            log.blue(error.details || "")
                            log.red(error.stack || '')
                        })
                        return this.exit();
                    }
                    log.green('构建成功')
                    // showWeChatQrCode();
                }))
            }
        )
    }

}
