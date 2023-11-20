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
exports.cocosPluginService = exports.CocosPluginService = void 0;
const declare_1 = require("./declare");
const Path = __importStar(require("path"));
const serve_1 = __importDefault(require("./commands/serve"));
const pack_1 = __importDefault(require("./commands/pack"));
const base_1 = __importDefault(require("./config/base"));
const lodash_1 = require("lodash");
const FS = __importStar(require("fs"));
const interpret_1 = require("interpret");
const rechoir_1 = require("rechoir");
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const log_1 = require("./log");
const plugin_mgr_1 = require("./plugin-mgr");
const create_1 = __importDefault(require("./commands/create"));
const FsExtra = __importStar(require("fs-extra"));
const ConfigTypeScript = "cc-plugin.config.ts";
const ProjectJson = "project.json";
class CocosPluginService {
    constructor(context) {
        this.webpackChainFns = [];
        this.plugins = [];
        this.projectConfig = this.defaults;
        this.pluginMgr = new plugin_mgr_1.PluginMgr(this);
        this.context = context || process.cwd();
        this.root = Path.join(__dirname, '..');
        this.resolvePlugins();
    }
    isCreatorPlugin() {
        const { type } = this.projectConfig;
        return type === declare_1.PluginType.PluginV2 || type === declare_1.PluginType.PluginV3;
    }
    isCreatorPluginV2() {
        const { type } = this.projectConfig;
        return type === declare_1.PluginType.PluginV2;
    }
    isCreatorPluginV3() {
        const { type } = this.projectConfig;
        return type === declare_1.PluginType.PluginV3;
    }
    isWeb() {
        const { type } = this.projectConfig;
        return type === declare_1.PluginType.Web;
    }
    resolvePlugins() {
        this.plugins.push(new base_1.default());
        this.plugins.push(new create_1.default());
        this.plugins.push(new serve_1.default());
        this.plugins.push(new pack_1.default());
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
        const configNames = ['./cc-plugin.config.js', `./${ConfigTypeScript}`];
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
        rechoir_1.prepare(interpret_1.extensions, file, this.root);
        const module = require(file);
        if (module.hasOwnProperty('default')) {
            return module.default;
        }
        else {
            return module;
        }
    }
    get defaults() {
        const options = declare_1.DefaultCocosPluginOptions;
        const manifest = {
            name: 'cocos-creator-plugin',
            version: '0.0.0',
            main: './src/main.ts',
        };
        return { manifest, options, type: declare_1.PluginType.Web };
    }
    readyPlugins() {
        this.plugins.forEach((plugin) => {
            plugin.apply(this.pluginMgr, this);
        });
    }
    init(type) {
        this.loadEnv();
        const userOptions = this.loadUserOptions();
        userOptions && this.checkUserOptions(userOptions, type);
        this.projectConfig = lodash_1.defaultsDeep(userOptions, this.defaults);
        this.projectConfig.type = type;
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
        // 相对目录
        if (projectDir.startsWith('./')) {
            log_1.log.red(`当type为creator插件时，options.outputProject 暂时不支持相对目录的写法：${projectDir}`);
            process.exit(0);
        }
        let output = projectDir;
        if (this.checkIsProjectDir(projectDir)) {
            output = Path.join(projectDir, pluginDir, pluginName);
            if (!FS.existsSync(output)) {
                log_1.log.yellow(`自动创建输出目录：${output}`);
                FsExtra.ensureDirSync(output);
            }
        }
        else {
            log_1.log.yellow(`options.outputProject需要配置为有效的Creator项目目录：${projectDir}`);
            output = projectDir;
        }
        return output;
    }
    getPluginDir(version) {
        if (version === declare_1.PluginType.PluginV2) {
            return 'packages';
        }
        else if (version === declare_1.PluginType.PluginV3) {
            return 'extensions';
        }
    }
    getConfigProjectPath(type) {
        let projectPath = null;
        const projCfg = Path.join(this.context, ProjectJson);
        if (FS.existsSync(projCfg)) {
            const cfg = JSON.parse(FS.readFileSync(projCfg, 'utf-8'));
            switch (type) {
                case declare_1.PluginType.PluginV2: {
                    projectPath = cfg.v2;
                    break;
                }
                case declare_1.PluginType.PluginV3: {
                    projectPath = cfg.v3;
                    break;
                }
            }
        }
        if (projectPath && FS.existsSync(projectPath)) {
            return projectPath;
        }
        return null;
    }
    checkUserOptions(userOptions, type) {
        // 根据配置，将output目录统一变为绝对路径
        const { options, manifest } = userOptions;
        let { outputProject } = options;
        const pluginDir = this.getPluginDir(type);
        if (typeof outputProject === 'object') {
            const { v2, v3, web } = outputProject;
            if (type === declare_1.PluginType.PluginV2 || type === declare_1.PluginType.PluginV3) {
                // 优先支持配置文件
                const cfgProject = this.getConfigProjectPath(type);
                let dirs = [];
                if (cfgProject) {
                    dirs.push({ url: cfgProject, source: ProjectJson });
                }
                if (v2 !== undefined && type === declare_1.PluginType.PluginV2) {
                    dirs.push({ url: v2, source: ConfigTypeScript });
                }
                if (v3 !== undefined && type === declare_1.PluginType.PluginV3) {
                    dirs.push({ url: v3, source: ConfigTypeScript });
                }
                if (dirs.length <= 0) {
                    log_1.log.red(`未配置options.outputProject`);
                }
                else {
                    for (let i = 0; i < dirs.length; i++) {
                        const { url, source } = dirs[i];
                        if (url && FS.existsSync(url)) {
                            options.output = this.catchOutput(url, pluginDir, manifest.name);
                            break;
                        }
                        else {
                            log_1.log.blue(`[${source}]里面的输出目录无效：${url}`);
                        }
                    }
                }
            }
            else if (web && type === declare_1.PluginType.Web) {
                let fullPath = Path.join(this.context, web);
                if (!FS.existsSync(fullPath)) {
                    log_1.log.yellow(`auto create directory: ${fullPath}`);
                    FsExtra.ensureDirSync(fullPath);
                }
                options.output = fullPath;
            }
        }
        else {
            options.output = this.catchOutput(outputProject, pluginDir, manifest.name);
        }
        if (options.output && FS.existsSync(options.output)) {
        }
        else {
            log_1.log.red(`options.outputProject配置无效:${options.output}`);
            process.exit(0);
        }
    }
}
exports.CocosPluginService = CocosPluginService;
exports.cocosPluginService = new CocosPluginService(process.cwd());
