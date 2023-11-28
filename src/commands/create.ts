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
