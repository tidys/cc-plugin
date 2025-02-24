"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const declare_1 = require("../declare");
const path_1 = __importDefault(require("path"));
const FsExtra = __importStar(require("fs-extra"));
const package_worker_1 = require("./package-worker");
class CocosPluginPackageJson {
    constructor(service) {
        this.bProduction = false;
        this.service = service;
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('PackageJson', (compilation) => {
            this.bProduction = compilation.compiler.options.mode === "production";
            this.buildPackageJsonFile();
        });
    }
    buildPackageJsonFile() {
        var _a, _b;
        let packageJson = {
            name: this.manifest.name,
            version: this.manifest.version,
            description: this.manifest.description || '',
            author: this.manifest.author || 'cocos-plugin-cli',
            main: './main.js',
        };
        const { type } = this.service.projectConfig;
        let packageWorker = null;
        if (type === declare_1.PluginType.PluginV2) {
            packageWorker = new package_worker_1.PackageV2(this.service.projectConfig, packageJson);
        }
        else if (type === declare_1.PluginType.PluginV3) {
            packageWorker = new package_worker_1.PackageV3(this.service.projectConfig, packageJson);
        }
        packageWorker === null || packageWorker === void 0 ? void 0 : packageWorker.assetDbBuild();
        // 面板
        packageWorker === null || packageWorker === void 0 ? void 0 : packageWorker.panelReady();
        (_a = this.manifest.panels) === null || _a === void 0 ? void 0 : _a.map((panel) => {
            if (panel.type === declare_1.Panel.Type.DockAble || panel.type === declare_1.Panel.Type.Simple) {
                packageWorker === null || packageWorker === void 0 ? void 0 : packageWorker.panelBuild(panel);
            }
        });
        // 菜单
        packageWorker === null || packageWorker === void 0 ? void 0 : packageWorker.menuReady();
        (_b = this.manifest.menus) === null || _b === void 0 ? void 0 : _b.map((menu) => {
            packageWorker === null || packageWorker === void 0 ? void 0 : packageWorker.menuBuild(menu);
        });
        const dependencies = this.getDependencies();
        if (dependencies) {
            packageJson.dependencies = dependencies;
        }
        this._savePackageJsonFile(packageJson);
    }
    getDependencies() {
        try {
            const filterDep = ['cc-plugin'];
            const file = path_1.default.join(this.service.context, 'package.json');
            if (FsExtra.existsSync(file)) {
                const data = FsExtra.readJSONSync(file);
                if (data && data.hasOwnProperty('dependencies')) {
                    const dependencies = data['dependencies'];
                    for (let key in dependencies) {
                        if (key.endsWith('.js')) {
                            delete dependencies[key];
                            continue;
                        }
                        if (filterDep.find(el => el.indexOf(key) !== -1)) {
                            delete dependencies[key];
                            continue;
                        }
                    }
                    return dependencies;
                }
            }
        }
        catch (e) {
            return null;
        }
        return null;
    }
    _savePackageJsonFile(data) {
        const options = this.service.projectConfig.options;
        const packageJsonFile = path_1.default.join(options.output, 'package.json');
        let spaces = options.min ? 0 : 4;
        if (this.bProduction) {
            spaces = 0;
        }
        FsExtra.writeJSONSync(packageJsonFile, data, { spaces });
    }
    get manifest() {
        return this.service.projectConfig.manifest;
    }
    get options() {
        return this.service.projectConfig.options;
    }
}
exports.default = CocosPluginPackageJson;
//# sourceMappingURL=package.json.js.map