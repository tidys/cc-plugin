import { PluginApi } from '../plugin-api';
import { PluginMgr } from '../plugin-mgr';
import CocosPluginService from '../service';
import * as Fs from 'fs';
import * as Path from 'path';
import { log } from '../log';
import *as FsExtra from 'fs-extra'
import { npmInstall } from '../plugin/npm-install';

export default class Create extends PluginApi {
    apply(api: PluginMgr, service: CocosPluginService): void {
        api.registerCommand('create', {
            description: '创建项目',
            arguments: [
                { name: 'name', desc: '项目名字' }
            ]
        }, (param) => {
            const projectName = param[0];
            const projectDir = Path.join(service.context, projectName)
            if (Fs.existsSync(projectDir)) {
                log.red(`目录已经存在：${projectDir}`);
                return
            }
            const templateDir = Path.join(service.root, './template/project')
            FsExtra.copySync(templateDir, projectDir);
            log.green('生成模板成功')
            // npmInstall(projectDir)
            log.green('玩的开心')
        })
    }
};
