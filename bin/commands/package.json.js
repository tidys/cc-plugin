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
let dealPanels = (a, b) => {
    return [];
};
class PackageJson {
    constructor(manifest, options) {
        this.options = {
            output: './dist',
            version: declare_1.PluginVersion.v2,
            min: false,
        };
        this.manifest = manifest;
        this.options = Object.assign(this.options, options);
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('PackageJson', () => {
        });
    }
    buildPackageJsonFile() {
        var _a, _b;
        let packageJson = {
            name: this.manifest.name,
            version: this.manifest.version,
        };
        packageJson.description = ((_a = this.manifest) === null || _a === void 0 ? void 0 : _a.description) || '';
        packageJson.author = this.manifest.author || 'cocos-plugin-cli';
        if ((_b = this.manifest.panels) === null || _b === void 0 ? void 0 : _b.length) {
            const panels = dealPanels(this.manifest.panels, this.options);
            if (this.options.version === declare_1.PluginVersion.v2) {
                panels.map((panel) => {
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
                });
            }
        }
        this._savePackageJsonFile(packageJson);
    }
    _savePackageJsonFile(data) {
        var _a;
        const packageJsonFile = path_1.default.join(((_a = this.options) === null || _a === void 0 ? void 0 : _a.output) || "", 'package.json');
        let spaces = 4;
        if (this.options) {
            spaces = this.options.min ? 0 : 4;
        }
        FsExtra.writeJSONSync(packageJsonFile, data, { spaces });
    }
    clean() {
        const { output } = this.options;
        if (output && FsExtra.existsSync(output)) {
            FsExtra.emptydirSync(output);
        }
    }
}
exports.default = PackageJson;
