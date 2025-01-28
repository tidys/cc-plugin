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
exports.cocosPluginService = exports.CocosPluginService = exports.ServiceMode = void 0;
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
const const_1 = require("./const");
var ServiceMode;
(function (ServiceMode) {
    ServiceMode[ServiceMode["Serve"] = 0] = "Serve";
    ServiceMode[ServiceMode["Pack"] = 1] = "Pack";
})(ServiceMode || (exports.ServiceMode = ServiceMode = {}));
const ccpConfigJson = "cc-plugin.json";
class CocosPluginService {
    constructor(context) {
        this.webpackChainFns = [];
        this.plugins = [];
        this.projectConfig = this.defaults;
        this.userWebpackConfig = { plugins: [] };
        this.mode = ServiceMode.Serve;
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
    isChromePlugin() {
        const { type } = this.projectConfig;
        return type === declare_1.PluginType.Chrome;
    }
    isElectron() {
        const { type } = this.projectConfig;
        return type === declare_1.PluginType.Electron;
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
                (0, dotenv_expand_1.default)(env);
            }
        });
    }
    loadUserWebpackConfig() {
        var _a;
        const configNames = [`./${const_1.ConfigWebpack}`];
        const ret = this._loadCode(configNames);
        if (ret) {
            const webpackCfg = ret;
            if (webpackCfg) {
                (_a = webpackCfg.plugins) === null || _a === void 0 ? void 0 : _a.forEach(plugin => {
                    var _a;
                    (_a = this.userWebpackConfig.plugins) === null || _a === void 0 ? void 0 : _a.push(plugin);
                });
            }
        }
    }
    loadUserOptions() {
        const configNames = ['./cc-plugin.config.js', `./${const_1.ConfigTypeScript}`];
        return this._loadCode(configNames);
    }
    _loadCode(configNames) {
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
        (0, rechoir_1.prepare)(interpret_1.extensions, file, this.root);
        const module = require(file);
        if (module.hasOwnProperty('default')) {
            return module.default;
        }
        else {
            return module;
        }
    }
    /**
     * @param name 校验是否在zh.ts,en.ts存在这个key
     */
    checkI18nKey(name) {
        const { i18n_en, i18n_zh } = this.projectConfig.manifest;
        this._checkI18nKey(i18n_en, name);
        this._checkI18nKey(i18n_zh, name);
    }
    _checkI18nKey(i18nFile, key) {
        if (i18nFile) {
            const fullPath = Path.join(this.context, i18nFile);
            if (FS.existsSync(fullPath)) {
                const obj = this.loadModule(fullPath);
                if (obj && obj[key] === undefined) {
                    console.log(`not exist ${key} in ${i18nFile}`);
                }
            }
            else {
                console.log(`not exist i18n file:${i18nFile}`);
            }
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
    isServerMode() {
        return this.mode === ServiceMode.Serve;
    }
    isPackMode() {
        return this.mode === ServiceMode.Pack;
    }
    init(type, mode) {
        this.mode = mode;
        this.loadEnv();
        const userOptions = this.loadUserOptions();
        if (userOptions) {
            this.checkUserOptions(userOptions, type);
        }
        this.projectConfig = (0, lodash_1.defaultsDeep)(userOptions, this.defaults);
        this.projectConfig.type = type;
        this.loadUserWebpackConfig();
        this.checkConfig();
    }
    /**
     * 处理asset db
     * server模式下需要link，pack模式下需要copy
     */
    dealAssetDb(link = true) {
        const { type } = this.projectConfig;
        const { manifest, options } = this.projectConfig;
        let dbDir = null;
        if (type === declare_1.PluginType.PluginV2) {
            const { asset_db_v2 } = manifest;
            dbDir = asset_db_v2 || null;
        }
        else if (type === declare_1.PluginType.PluginV3) {
            const { asset_db_v3 } = manifest;
            dbDir = asset_db_v3 || null;
        }
        if (dbDir) {
            if (!dbDir.path) {
                log_1.log.red(`asset db dir path is empty`);
                process.exit(1);
            }
            const fullpath = Path.join(this.context, dbDir.path);
            if (!FS.existsSync(fullpath)) {
                log_1.log.red(`asset db dir not exist: ${dbDir.path}`);
                process.exit(1);
            }
            const targetDir = Path.join(options.output, dbDir.path);
            if (FS.existsSync(targetDir)) {
                FsExtra.removeSync(targetDir);
            }
            if (link) {
                FsExtra.ensureSymlinkSync(fullpath, targetDir, 'dir');
            }
            else {
                FsExtra.copySync(fullpath, targetDir);
            }
        }
    }
    // 校验插件配置
    checkConfig() {
        if (this.projectConfig.type === declare_1.PluginType.Chrome) {
            if (!this.projectConfig.manifest.chrome) {
                log_1.log.red('chrome插件需要配置manifest.chrome字段');
                process.exit(0);
            }
        }
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
    catchOutput(type, projectDir, pluginDir, pluginName) {
        // chrome
        if (type === declare_1.PluginType.Chrome) {
            return projectDir;
        }
        if (projectDir.startsWith('./')) {
            // 相对目录，不检查是否为creator项目
            const output = Path.join(this.context, projectDir);
            FsExtra.ensureDirSync(output);
            return output;
        }
        else {
            // 绝对路径
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
    }
    getPluginDir(version) {
        if (version === declare_1.PluginType.PluginV2) {
            return 'packages';
        }
        else if (version === declare_1.PluginType.PluginV3) {
            return 'extensions';
        }
        return "";
    }
    getConfigProjectPath(type) {
        let projectPath = null;
        const configFile = Path.join(this.context, ccpConfigJson);
        if (FS.existsSync(configFile)) {
            const cfg = JSON.parse(FS.readFileSync(configFile, 'utf-8'));
            switch (type) {
                case declare_1.PluginType.PluginV2: {
                    projectPath = cfg.v2;
                    break;
                }
                case declare_1.PluginType.PluginV3: {
                    projectPath = cfg.v3;
                    break;
                }
                case declare_1.PluginType.Web: {
                    projectPath = cfg.chrome;
                }
            }
        }
        return projectPath;
    }
    getFullPath(path) {
        if (path.startsWith('./')) {
            return Path.join(this.context, path);
        }
        // 必须先判断相对路径，因为existsSync会判断相对路径是否存在
        if (FS.existsSync(path)) {
            return path;
        }
        return null;
    }
    checkPluginName(name) {
        if (!name) {
            log_1.log.red("插件名字为空，请在cc-plugin.config.ts中填写有效的插件名字");
            process.exit(0);
        }
        // 对应的问题： Invalid package name:  do not contains uppercase characters.
        if (/^[a-z][a-z0-9-_]{0,213}$/.test(name) === false) {
            log_1.log.red(`插件名字 ${name} 不合法`);
            const err = [];
            if (/[A-Z]/.test(name)) {
                err.push(`不能包含大写字母`);
            }
            if (/^[a-z]/.test(name) === false) {
                err.push(`必须以小写字母开头`);
            }
            if (err.length) {
                let str = "";
                for (let i = 0; i < err.length; i++) {
                    str += (`${i + 1}.${err[i]}\n`);
                }
                log_1.log.red(str);
            }
            log_1.log.red(`请检查是否符合以下规范：\n1.必须以小写字母开头\n2.只能包含小写字母、数字、下划线、横线。`);
            process.exit(0);
        }
    }
    checkUserOptions(userOptions, type) {
        // 根据配置，将output目录统一变为绝对路径
        const { options, manifest } = userOptions;
        this.checkPluginName(manifest.name);
        let { outputProject } = options;
        const pluginDir = this.getPluginDir(type);
        if (typeof outputProject === 'object') {
            const { v2, v3, web, chrome, electron } = outputProject;
            if (type === declare_1.PluginType.PluginV2 || type === declare_1.PluginType.PluginV3 || type === declare_1.PluginType.Chrome) {
                // 优先支持配置文件
                const cfgProject = this.getConfigProjectPath(type);
                let dirs = [];
                if (cfgProject) {
                    dirs.push({ url: cfgProject, source: ccpConfigJson });
                }
                // 其次支持cc-plugin.config.ts里面的配置
                if (v2 !== undefined && type === declare_1.PluginType.PluginV2) {
                    dirs.push({ url: v2, source: const_1.ConfigTypeScript });
                }
                if (v3 !== undefined && type === declare_1.PluginType.PluginV3) {
                    dirs.push({ url: v3, source: const_1.ConfigTypeScript });
                }
                if (chrome !== undefined && type === declare_1.PluginType.Chrome) {
                    const url = this.getFullPath(chrome);
                    if (url) {
                        if (!FS.existsSync(url)) {
                            log_1.log.yellow(`auto create directory: ${url}`);
                            FsExtra.ensureDirSync(url);
                        }
                        dirs.push({ url, source: const_1.ConfigTypeScript });
                    }
                }
                if (dirs.length <= 0) {
                    log_1.log.red(`未配置options.outputProject, 详细配置信息参考： https://www.npmjs.com/package/cc-plugin#%E5%85%B3%E4%BA%8Eoptionsoutputproject`);
                }
                else {
                    for (let i = 0; i < dirs.length; i++) {
                        const { url, source } = dirs[i];
                        if (url) {
                            options.output = this.catchOutput(type, url, pluginDir, manifest.name);
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
            else if (electron && type === declare_1.PluginType.Electron) {
                let fullPath = Path.join(this.context, electron);
                if (!FS.existsSync(fullPath)) {
                    log_1.log.yellow(`auto create directory: ${fullPath}`);
                    FsExtra.ensureDirSync(fullPath);
                }
                options.output = fullPath;
            }
        }
        else {
            options.output = this.catchOutput(type, outputProject, pluginDir, manifest.name);
        }
        if (options.output && FS.existsSync(options.output)) {
            if (type === declare_1.PluginType.Web || type === declare_1.PluginType.Chrome) {
                // web不会有node_modules目录，所以直接清空
                FsExtra.emptyDirSync(options.output);
                log_1.log.yellow(`清空目录：${options.output}`);
            }
            else {
                // TODO: 删除非node_modules目录
            }
        }
        else {
            log_1.log.red(`options.outputProject配置无效:${options.output}`);
            process.exit(0);
        }
    }
}
exports.CocosPluginService = CocosPluginService;
exports.cocosPluginService = new CocosPluginService(process.cwd());
//# sourceMappingURL=service.js.map