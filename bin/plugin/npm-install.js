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
Object.defineProperty(exports, "__esModule", { value: true });
exports.npmInstall = void 0;
const child_process = __importStar(require("child_process"));
const Fs = __importStar(require("fs-extra"));
const Path = __importStar(require("path"));
const npmInstall = function (rootDir) {
    let canInstall = false;
    const packageJson = Path.join(rootDir, 'package.json');
    const nodeModules = Path.join(rootDir, 'node_modules');
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
    }
    else {
        canInstall = true;
    }
    if (canInstall) {
        // 判断下目录是否存在依赖，再决定是否npm i
        console.log('npm install ...');
        child_process.execSync('npm install', { cwd: rootDir });
        console.log('npm install succeed');
    }
    else {
        console.log('npm has installed.');
    }
};
exports.npmInstall = npmInstall;
class NpmInstall {
    constructor(dir) {
        this.dir = dir;
    }
    apply(compiler) {
        compiler.hooks.afterDone.tap('npm-install', () => {
            const rootDir = compiler.options.output.path;
            exports.npmInstall(rootDir);
        });
    }
}
exports.default = NpmInstall;
