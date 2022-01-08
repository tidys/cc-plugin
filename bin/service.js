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
const log_1 = require("./log");
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
            outputProject: './',
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
        userOptions && this.checkUserOptions(userOptions);
        this.projectConfig = lodash_1.defaultsDeep(userOptions, this.defaults);
        this.plugins.forEach(({ id, apply }) => {
            apply(new plugin_api_1.PluginApi(id, this), this.projectConfig);
        });
    }
    checkIsProjectDir(projDir) {
        // 必须存在这个目录
        const needDirs = ['assets'];
        let isProject = true;
        for (let i = 0; i < needDirs.length; i++) {
            const dir = needDirs[i];
            const assets = Path.join(projDir, dir);
            if (!FS.existsSync(assets)) {
                isProject = false;
                break;
            }
            if (FS.statSync(projDir).isFile()) {
                isProject = false;
                break;
            }
        }
        return isProject;
    }
    catchOutput(projectDir, pluginDir, pluginName) {
        let output = projectDir;
        if (this.checkIsProjectDir(projectDir)) {
            output = Path.join(projectDir, pluginDir, pluginName);
        }
        else {
            log_1.log.yellow(`options.outputProject推荐配置为Creator生成的项目目录：${projectDir}`);
            output = projectDir;
        }
        return output;
    }
    getPluginDir(version) {
        if (version === declare_1.PluginVersion.v2) {
            return 'packages';
        }
        else if (version === declare_1.PluginVersion.v3) {
            return 'extensions';
        }
    }
    checkUserOptions(userOptions) {
        // 根据配置，将output目录统一变为绝对路径
        const { options, manifest } = userOptions;
        let { version, outputProject } = options;
        const pluginDir = this.getPluginDir(version);
        if (typeof outputProject === 'object') {
            const { v2, v3 } = outputProject;
            if (v2 && version === declare_1.PluginVersion.v2) {
                options.output = this.catchOutput(v2, pluginDir, manifest.name);
            }
            else if (v3 && version === declare_1.PluginVersion.v3) {
                options.output = this.catchOutput(v3, pluginDir, manifest.name);
            }
        }
        else {
            options.output = this.catchOutput(outputProject, pluginDir, manifest.name);
        }
        if (!options.output) {
            log_1.log.red(`无效的output：${options.output}`);
        }
        if (!FS.existsSync(options.output)) {
            log_1.log.yellow(`output不存在：${options.output}`);
        }
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
