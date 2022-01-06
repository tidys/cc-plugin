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
const declare_1 = require("./declare");
const Path = __importStar(require("path"));
const serve_1 = __importDefault(require("./commands/serve"));
const plugin_api_1 = require("./plugin-api");
const lodash_1 = require("lodash");
const FS = __importStar(require("fs"));
const interpret_1 = require("interpret");
const rechoir_1 = require("rechoir");
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
class CocosPluginService {
    constructor(context) {
        this.webpackChainFns = [];
        this.commands = {};
        this.plugins = [];
        this.projectConfig = this.defaults;
        this.context = context || process.cwd();
        this.root = Path.join(__dirname, '..');
        this.resolvePlugins();
    }
    resolvePlugins() {
        this.plugins.push({ id: 'serve', apply: serve_1.default });
    }
    loadEnv() {
        const dirs = [this.context, this.root];
        dirs.forEach(dir => {
            const file = Path.resolve(dir, '.env');
            if (FS.existsSync(file)) {
                const env = dotenv_1.default.config({ path: file });
                dotenv_expand_1.default(env);
            }
        });
    }
    loadUserOptions() {
        const configNames = ['./cc-plugin.config.js', './cc-plugin.config.ts'];
        let fileConfigPath = '';
        for (let name of configNames) {
            const fullPath = Path.join(this.context, name);
            if (FS.existsSync(fullPath)) {
                fileConfigPath = fullPath;
                break;
            }
        }
        if (fileConfigPath) {
            return this.loadModule(fileConfigPath);
        }
        return null;
    }
    loadModule(file) {
        // 从当前package的node_modules中找依赖
        rechoir_1.prepare(interpret_1.extensions, file);
        const module = require(file);
        if (module.hasOwnProperty('default')) {
            return module.default;
        }
        else {
            return module;
        }
    }
    get defaults() {
        const options = {
            output: './dist',
            version: declare_1.PluginVersion.v2,
            min: false,
        };
        const manifest = {
            name: 'cocos-creator-plugin',
            version: '0.0.0',
            main: './src/main.ts',
        };
        return { manifest, options };
    }
    init() {
        this.loadEnv();
        const userOptions = this.loadUserOptions();
        this.projectConfig = lodash_1.defaultsDeep(userOptions, this.defaults);
        this.plugins.forEach(({ id, apply }) => {
            apply(new plugin_api_1.PluginApi(id, this), this.projectConfig);
        });
    }
    run() {
        this.init();
        let name = 'serve';
        const command = this.commands[name];
        if (command) {
            command.fn(this);
        }
    }
}
exports.default = CocosPluginService;
