import webpack from 'webpack';
import * as Fs from 'fs'
import * as Path from 'path'
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

    private zipDir(dir: string, pluginName: string) {
        let zip = new JsZip();
        this._packageDir(dir, zip.folder(pluginName))
        let dirParent = Path.dirname(dir);
        if (!Fs.existsSync(dirParent)) {
            dirParent = dir;
        }
        const zipFilePath = Path.join(dirParent, `${pluginName}.zip`)
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
                console.log('✅[打包]成功!');

            })
            .on('error', () => {
                console.log('❌[打包]失败: ');
            });
    }

    private fileName: string = ''

    constructor(fileName: string) {
        if (!fileName.endsWith('.zip')) {
            this.fileName = `${fileName}.zip`
        } else {
            this.fileName = fileName;
        }
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterDone.tap('zip', () => {
            const dir = compiler.options.output.path;
            if (dir) {
                this.zipDir(dir, this.fileName);
            }
        })
    }
}
