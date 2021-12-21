import webpack from 'webpack';
import * as child_process from 'child_process';
import * as Fs from 'fs';

export default class NpmInstall {
    private dir: string;

    constructor(dir: string) {
        this.dir = dir;
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterDone.tap('npm-install', () => {
            if (this.dir && Fs.existsSync(this.dir)) {
                console.log('npm install ...')
                child_process.execSync('npm install', { cwd: this.dir })
            }
        })
    }
}
