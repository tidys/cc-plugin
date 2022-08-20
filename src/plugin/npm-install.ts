import webpack from 'webpack';
import * as child_process from 'child_process';
import * as Fs from 'fs-extra';
import * as Path from 'path'
import { root } from 'postcss';


export const npmInstall = function (rootDir: string) {
    let canInstall = false;
    const packageJson = Path.join(rootDir, 'package.json');
    const nodeModules = Path.join(rootDir, 'node_modules')
    if (Fs.existsSync(nodeModules) && Fs.existsSync(packageJson)) {
        const data = Fs.readJSONSync(packageJson);
        if (data && data.dependencies) {
            const dirs = Fs.readdirSync(nodeModules);
            for (let key in data.dependencies) {
                if (!dirs.find(el => el === key)) {
                    canInstall = true;
                    break;
                }
            }
        }
    } else {
        canInstall = true;
    }

    if (canInstall) {
        // 判断下目录是否存在依赖，再决定是否npm i
        console.log('npm install ...')
        child_process.execSync('npm install', { cwd: rootDir })
        console.log('npm install succeed')
    } else {
        console.log('npm has installed.')
    }
}
export default class NpmInstall {
    private dir: string;

    constructor(dir: string) {
        this.dir = dir;
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterDone.tap('npm-install', () => {
            const rootDir = compiler.options.output.path! as string;
            npmInstall(rootDir)
        })
    }
}
