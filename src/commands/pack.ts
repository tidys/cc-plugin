import { PluginApi } from '../plugin-api';
import CocosPluginService, { ProjectConfig } from '../service';
import Config from 'webpack-chain';
import webpack from 'webpack'
import { PluginMgr } from '../plugin-mgr';
import { log } from '../log';
import Zip from '../plugin/zip';

export default class Pack extends PluginApi {
    exit() {
        process.exit(0);
    }

    apply(api: PluginMgr, service: CocosPluginService) {
        api.registerCommand('pack',
            { description: '打包插件' },
            (param) => {
                api.chainWebpack(async (webpackChain: Config) => {
                    webpackChain.mode('production')
                    webpackChain.devtool(false);

                    const name = service.projectConfig.manifest.name;
                    webpackChain.plugin('zip').use(Zip, [name])
                })
                const webpackConfig = api.resolveChainWebpackConfig();
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
                    log.green('打包成功')
                }))
            }
        )
    }

}
