import webpack from 'webpack';
import * as Fs from 'fs'
import * as Path from 'path'
import { exec } from 'child_process'
import * as OS from 'os'
// @ts-ignore
import JsZip from 'jszip'

export default class Zip {
    _packageDir(rootPath: string, zip: any) {
        let dir = Fs.readdirSync(rootPath);
        for (let i = 0; i < dir.length; i++) {
            let itemDir = dir[i];
            let itemFullPath = Path.join(rootPath, itemDir);
            let stat = Fs.statSync(itemFullPath);
            if (stat.isFile()) {
                zip.file(itemDir, Fs.readFileSync(itemFullPath));
            } else if (stat.isDirectory()) {
                this._packageDir(itemFullPath, zip.folder(itemDir));
            }
        }
    }

    private getOutDir(dir: string): string {
        if (this.outDir) {
            if (!Fs.existsSync(this.outDir)) {
                Fs.mkdirSync(this.outDir);
            }
            return this.outDir;
        }
        // 输出目录同级
        let dirParent = Path.dirname(dir);
        if (Fs.existsSync(dirParent)) {
            return dirParent;
        }
        return dir;
    }

    private zipDir(dir: string, pluginName: string) {
        const zip = new JsZip();
        this._packageDir(dir, zip.folder(pluginName))
        const outDir = this.getOutDir(dir);
        const zipFilePath = Path.join(outDir, `${pluginName}.zip`)
        if (Fs.existsSync(zipFilePath)) {
            Fs.unlinkSync(zipFilePath);
            console.log('⚠[删除] 旧版本压缩包: ' + zipFilePath);
        }
        zip.generateNodeStream({
            type: 'nodebuffer',
            streamFiles: true,
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        })
            .pipe(Fs.createWriteStream(zipFilePath))
            .on('finish', () => {
                this.showFileInExplore(zipFilePath)
                console.log(`生成压缩包成功，把压缩包上传到cocos store就可以啦\n ${zipFilePath}`);
            })
            .on('error', () => {
                console.log('生成压缩包失败');
            });
    }


    showFileInExplore(showPath: string) {
        let platform = OS.platform();
        let cmd = null;
        if (platform === 'darwin') {
            cmd = 'open ' + showPath;
        } else if (platform === 'win32') {
            cmd = 'explorer ' + showPath;
        }
        if (cmd) {
            console.log('😂[CMD] ' + cmd);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(stderr);
                } else {
                    // console.log(stdout);
                }
            });
        }
    }


    private fileName: string = ''
    private version: string = '';
    private outDir: string = '';

    constructor(fileName: string, version: string, outDir: string) {
        this.fileName = fileName;
        this.version = version;
        this.outDir = outDir;
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterDone.tap('zip', () => {
            console.log('开始构建压缩包')
            const dir = compiler.options.output.path;
            if (dir) {
                this.zipDir(dir, `${this.fileName}-v${this.version}`);
            }
        })
    }
}
