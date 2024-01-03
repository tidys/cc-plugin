"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = __importStar(require("fs"));
const Path = __importStar(require("path"));
const child_process_1 = require("child_process");
const OS = __importStar(require("os"));
// @ts-ignore
const jszip_1 = __importDefault(require("jszip"));
const declare_1 = require("../declare");
class Zip {
    constructor(service) {
        this.fileName = '';
        this.version = '';
        this.outDir = '';
        const zipOutput = service.projectConfig.options.zipOutput || './dist';
        let outDir = "";
        if (zipOutput.startsWith("./")) {
            outDir = Path.join(service.context, zipOutput);
        }
        else {
            outDir = zipOutput;
        }
        let { name, version } = service.projectConfig.manifest;
        const { type } = service.projectConfig;
        const typeName = this.getPluginTypeName(type);
        if (typeName && typeName.length > 0) {
            name = `${name}_${typeName}`;
        }
        this.fileName = name;
        this.version = version;
        this.outDir = outDir;
        this.projectConfig = service.projectConfig;
    }
    _packageDir(rootPath, zip) {
        let dir = Fs.readdirSync(rootPath);
        for (let i = 0; i < dir.length; i++) {
            let itemDir = dir[i];
            let itemFullPath = Path.join(rootPath, itemDir);
            let stat = Fs.statSync(itemFullPath);
            if (stat.isFile()) {
                zip.file(itemDir, Fs.readFileSync(itemFullPath));
            }
            else if (stat.isDirectory()) {
                this._packageDir(itemFullPath, zip.folder(itemDir));
            }
        }
    }
    getOutDir(dir) {
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
    zipDir(dir, pluginName) {
        // remove old zip
        const outDir = this.getOutDir(dir);
        const zipFilePath = Path.join(outDir, `${pluginName}.zip`);
        if (Fs.existsSync(zipFilePath)) {
            Fs.unlinkSync(zipFilePath);
            console.log('删除旧版本压缩包: ' + zipFilePath);
        }
        // pack
        const zip = new jszip_1.default();
        this._packageDir(dir, zip.folder(pluginName));
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
            this.showFileInExplore(zipFilePath);
            const { type } = this.projectConfig;
            const { site, store } = this.projectConfig.manifest;
            console.log(`生成压缩包成功: ${zipFilePath}`);
            if (type === declare_1.PluginType.Web) {
                const siteString = site ? site.join(', ') : "";
                console.log(`压缩包部署到网站即可。${siteString}`);
            }
            else if (type === declare_1.PluginType.PluginV2 || type === declare_1.PluginType.PluginV3) {
                const url = "https://store-my.cocos.com/seller/resources/";
                console.log(`把压缩包上传到cocos store就可以啦: ${url}`);
                if (store) {
                    const storeDev = this.getStoreDev(store);
                    if (storeDev) {
                        console.log(`插件开发者后台：${storeDev}`);
                    }
                    else {
                        console.warn(`配置的store字段异常`);
                    }
                }
            }
        })
            .on('error', () => {
            console.log('生成压缩包失败');
        });
    }
    getStoreDev(store) {
        const storeTest = "https://store.cocos.com/app/detail/5205";
        const devTest = "https://store-my.cocos.com/seller/resources/detail/5205";
        if (!store) {
            return "";
        }
        const char = '/';
        while (store.endsWith(char)) {
            store = store.substring(0, store.length - char.length);
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
    showFileInExplore(showPath) {
        let platform = OS.platform();
        let cmd = null;
        if (platform === 'darwin') {
            cmd = 'open ' + showPath;
        }
        else if (platform === 'win32') {
            cmd = 'explorer ' + showPath;
        }
        if (cmd) {
            console.log('😂[CMD] ' + cmd);
            child_process_1.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(stderr);
                }
                else {
                    // console.log(stdout);
                }
            });
        }
    }
    getPluginTypeName(type) {
        switch (type) {
            case declare_1.PluginType.PluginV2:
                return 'plugin-v2';
            case declare_1.PluginType.PluginV3:
                return 'plugin-v3';
            case declare_1.PluginType.Web:
                return "web";
            default:
                return '';
        }
    }
    apply(compiler) {
        compiler.hooks.afterDone.tap('zip', (state) => {
            const bProduction = state.compilation.compiler.options.mode === "production";
            console.log('开始构建压缩包');
            const dir = compiler.options.output.path;
            if (dir) {
                this.zipDir(dir, `${this.fileName}-v${this.version}`);
            }
        });
    }
}
exports.default = Zip;
//# sourceMappingURL=zip.js.map