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
const declare_1 = require("../declare");
const path_1 = __importDefault(require("path"));
const FsExtra = __importStar(require("fs-extra"));
class CocosPluginPackageJson {
    constructor(service) {
        this.service = service;
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('PackageJson', () => {
            this.buildPackageJsonFile();
        });
    }
    buildPackageJsonFile() {
        var _a, _b, _c;
        let packageJson = {
            name: this.manifest.name,
            version: this.manifest.version,
            main: './main.js',
        };
        packageJson.description = this.manifest.description || '';
        packageJson.author = this.manifest.author || 'cocos-plugin-cli';
        (_a = this.manifest.panels) === null || _a === void 0 ? void 0 : _a.map((panel) => {
            if (this.options.version === declare_1.PluginVersion.v2) {
                const panelName = !!panel.name ? `panel.${panel.name}` : 'panel';
                if (!packageJson.hasOwnProperty(panelName)) {
                    // @ts-ignore
                    packageJson[`${panelName}`] = {
                        main: panel.main,
                        title: panel.title,
                        type: panel.type,
                        width: panel.width,
                        height: panel.height,
                        'min-width': panel.minWidth,
                        'min-height': panel.minHeight,
                    };
                }
                else {
                    console.log('重复的panel');
                }
            }
        });
        if ((_b = this.manifest.menus) === null || _b === void 0 ? void 0 : _b.length) {
            let menus = packageJson['main-menu'] = {};
            (_c = this.manifest.menus) === null || _c === void 0 ? void 0 : _c.map((menu) => {
                if (this.options.version === declare_1.PluginVersion.v2) {
                    menus[menu.path] = { message: menu.message };
                }
            });
        }
        const dependencies = this.getDependencies();
        if (dependencies) {
            packageJson.dependencies = dependencies;
        }
        this._savePackageJsonFile(packageJson);
    }
    getDependencies() {
        try {
            const file = path_1.default.join(this.service.context, 'package.json');
            if (FsExtra.existsSync(file)) {
                const data = FsExtra.readJSONSync(file);
                if (data && data.hasOwnProperty('dependencies')) {
                    return data['dependencies'];
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
