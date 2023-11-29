import { PluginApi } from '../plugin-api';
import { PluginMgr } from '../plugin-mgr';
import { CocosPluginService } from '../service';
import * as Fs from 'fs';
import * as Path from 'path';
import { log } from '../log';
import *as FsExtra from 'fs-extra'
import { npmInstall } from '../plugin/npm-install';
import { OptionValues } from 'commander';
import { showWeChatQrCode } from './tool';
import { PluginType } from '../declare';

export default class Create extends PluginApi {
    apply(api: PluginMgr, service: CocosPluginService): void {
        api.registerCommand('create', {
            description: '创建项目',
            arguments: [
                { name: 'name', desc: '项目名字', required: false, value: "ccp-plugin" }
            ],
            options: [
                { name: '--override', desc: "强制覆盖当前目录" },
                { name: '--clean', desc: '清空目录' }
            ]
        }, (projectName: string, opts: OptionValues) => {
            // 校验是否在creator项目目录执行
            const dir = process.cwd();
            if (service.checkIsProjectDir(dir)) {
                log.red(`创建失败: ${dir}是个creator项目`)
                return;
            }
            const extDirs = [
                service.getPluginDir(PluginType.PluginV2),
                service.getPluginDir(PluginType.PluginV3)
            ]
            for (let i = 0; i < extDirs.length; i++) {
                const ext = extDirs[i];
                const dirName = Path.basename(dir);
                if (dirName === ext) {
                    if (service.checkIsProjectDir(Path.join(dir, '../'))) {
                        log.red(`创建失败: ${dir}是creator项目的扩展目录`);
                        return;
                    }
                }
            }

            const projectDir = Path.join(service.context, projectName)
            if (Fs.existsSync(projectDir)) {
                if (opts.override) {
                } else {
                    log.red(`目录已经存在：${projectDir}`);
                    return
                }
                if (opts.clean) {
                    FsExtra.emptydirSync(projectDir);
                }
            }
            const templateDir = Path.join(service.root, './template/project')
            FsExtra.copySync(templateDir, projectDir);
            log.green('生成模板成功')
            // npmInstall(projectDir)
            showWeChatQrCode()
        })
    }
};
