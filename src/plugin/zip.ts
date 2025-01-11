import webpack from 'webpack';
import * as Fs from 'fs'
import * as Path from 'path'
import { exec } from 'child_process'
import * as OS from 'os'
// @ts-ignore
import JsZip from 'jszip'
import { CocosPluginService, ProjectConfig } from '../service';
import { PluginType } from '../declare';

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
    private deleteUnNeedFiles(dir: string) {
        const files = ['package-lock.json'];
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            const fullPath = Path.join(dir, item)
            if (Fs.existsSync(fullPath)) {
                Fs.unlinkSync(fullPath)
            }
        }
    }
    private zipDir(dir: string, pluginName: string) {
        // remove old zip
        const outDir = this.getOutDir(dir);
        const zipFilePath = Path.join(outDir, `${pluginName}.zip`)
        if (Fs.existsSync(zipFilePath)) {
            Fs.unlinkSync(zipFilePath);
            console.log('删除旧版本压缩包: ' + zipFilePath);
        }
        this.deleteUnNeedFiles(dir);
        // pack
        const zip = new JsZip();
        this._packageDir(dir, zip.folder(pluginName))
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
                const { type } = this.projectConfig;
                const { site, store } = this.projectConfig.manifest;
                console.log(`生成压缩包成功: ${zipFilePath}`)
                if (type === PluginType.Web) {
                    const siteString = site ? site.join(', ') : "";
                    console.log(`压缩包部署到网站即可。${siteString}`);
                } else if (type === PluginType.PluginV2 || type === PluginType.PluginV3) {
                    const url = "https://store-my.cocos.com/seller/resources/";
                    console.log(`把压缩包上传到cocos store就可以啦: ${url}`);
                    if (store) {
                        const storeDev = this.getStoreDev(store)
                        if (storeDev) {
                            console.log(`插件开发者后台：${storeDev}`)
                        } else {
                            console.warn(`配置的store字段异常`);
                        }
                    }
                }
            })
            .on('error', () => {
                console.log('生成压缩包失败');
            });
    }
    private getStoreDev(store: string): string {
        const storeTest = "https://store.cocos.com/app/detail/5205"
        const devTest = "https://store-my.cocos.com/seller/resources/detail/5205"
        if (!store) {
            return ""
        }
        const char = '/';
        while (store.endsWith(char)) {
            store = store.substring(0, store.length - char.length)
        }
        const arr = store.split(char);
        if (arr.length) {
            const id = arr[arr.length - 1];
            if (id) {
                return `https://store-my.cocos.com/seller/resources/detail/${id}`;
            }
        }
        return "";
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
    private projectConfig: ProjectConfig;
    constructor(service: CocosPluginService,) {
        const zipOutput = service.projectConfig.options.zipOutput || './dist';
        let outDir = "";
        if (zipOutput.startsWith("./")) {
            outDir = Path.join(service.context, zipOutput);
        } else {
            outDir = zipOutput;
        }

        let { name, version } = service.projectConfig.manifest;
        const { type } = service.projectConfig;
        const typeName = this.getPluginTypeName(type!);
        if (typeName && typeName.length > 0) {
            name = `${name}_${typeName}`;
        }
        this.fileName = name;
        this.version = version;
        this.outDir = outDir;
        this.projectConfig = service.projectConfig;
    }
    private getPluginTypeName(type: PluginType) {
        switch (type) {
            case PluginType.PluginV2:
                return 'plugin-v2';
            case PluginType.PluginV3:
                return 'plugin-v3';
            case PluginType.Web:
                return "web";
            case PluginType.Chrome:
                return "chrome";
            default:
                return '';
        }
    }
    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterDone.tap('zip', (state: webpack.Stats) => {
            const bProduction = state.compilation.compiler.options.mode === "production";
            console.log('开始构建压缩包')
            const dir = compiler.options.output.path;
            if (dir) {
                this.zipDir(dir, `${this.fileName}-v${this.version}`);
            }
        })
    }
}
