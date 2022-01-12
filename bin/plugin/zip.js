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
// @ts-ignore
const jszip_1 = __importDefault(require("jszip"));
class Zip {
    constructor(fileName) {
        this.fileName = '';
        if (!fileName.endsWith('.zip')) {
            this.fileName = `${fileName}.zip`;
        }
        else {
            this.fileName = fileName;
        }
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
    zipDir(dir, pluginName) {
        let zip = new jszip_1.default();
        this._packageDir(dir, zip.folder(pluginName));
        let dirParent = Path.dirname(dir);
        if (!Fs.existsSync(dirParent)) {
            dirParent = dir;
        }
        const zipFilePath = Path.join(dirParent, `${pluginName}.zip`);
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
    apply(compiler) {
        compiler.hooks.afterDone.tap('zip', () => {
            const dir = compiler.options.output.path;
            if (dir) {
                this.zipDir(dir, this.fileName);
            }
        });
    }
}
exports.default = Zip;
