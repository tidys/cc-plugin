import { copyFileSync, existsSync, unlink, unlinkSync } from 'fs';
import { log } from '../log';
import { join } from 'path';
import { CocosPluginService } from 'service';
import webpack from 'webpack';
export default class Readme {
    private service;

    constructor(service: CocosPluginService) {
        this.service = service;
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterDone.tap('npm-install', () => {
            const rootDir = compiler.options.output.path! as string;
            const files = ['README.zh.md', 'README.en.md']
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const readme = join(this.service.context, file)
                if (existsSync(readme)) {
                    const target = join(rootDir, file);
                    if (existsSync(target)) {
                        unlinkSync(target)
                    }
                    copyFileSync(readme, target);
                    log.blue(`${file} has been copied to ${rootDir}`);
                } else {
                    log.yellow(`${file} not found, suggest provide it in ${this.service.context}`)
                }
            }
        })
    }
}
