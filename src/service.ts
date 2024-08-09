import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginType
} from './declare';

import * as Path from 'path';
import Serve from './commands/serve'
import Pack from './commands/pack'
import Base from './config/base'
import { PluginApi } from './plugin-api';
import { defaultsDeep } from 'lodash'
import * as FS from 'fs';
import { extensions } from 'interpret'
import { prepare } from 'rechoir'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { log } from './log';
import { PluginMgr } from './plugin-mgr';
import Create from './commands/create';
import * as FsExtra from 'fs-extra'
import { ConfigTypeScript, ConfigWebpack } from './const';
import type * as webpack from 'webpack'

export interface ProjectConfig {
    manifest: CocosPluginManifest,
    options: CocosPluginOptions,
    type: PluginType,
}

const ccpConfigJson = "cc-plugin.json";
/**
 * 对应的webpack配置
 */
interface UserWebpackConfig {
    /**
    * 用户自定义的webpack 插件
    */
    plugins?: Array<webpack.ProvidePlugin | webpack.WebpackPluginInstance>;
}
export class CocosPluginService {
    public webpackChainFns: Function[] = [];
    public plugins: PluginApi[] = [];
    /**
     * 执行cc-plugin所在的目录，也就是cc-plugin.config.ts所在的目录
     */
    public context: string;
    /**
     * cc-plugin源码所在的目录，也就是cc-plugin的安装目录
     */
    public root: string;
    public projectConfig: ProjectConfig = this.defaults;
    public pluginMgr: PluginMgr;
    public userWebpackConfig: UserWebpackConfig = { plugins: [] };

    constructor(context: string) {
        this.pluginMgr = new PluginMgr(this);
        this.context = context || process.cwd();
        this.root = Path.join(__dirname, '..')
        this.resolvePlugins();
    }

    public isCreatorPlugin() {
        const { type } = this.projectConfig;
        return type === PluginType.PluginV2 || type === PluginType.PluginV3;
    }

    public isCreatorPluginV2() {
        const { type } = this.projectConfig;
        return type === PluginType.PluginV2;
    }

    public isCreatorPluginV3() {
        const { type } = this.projectConfig;
        return type === PluginType.PluginV3;
    }

    public isWeb() {
        const { type } = this.projectConfig;
        return type === PluginType.Web;
    }
    public isChromePlugin() {
        const { type } = this.projectConfig;
        return type === PluginType.Chrome;
    }

    private resolvePlugins() {
        this.plugins.push(new Base())
        this.plugins.push(new Create())
        this.plugins.push(new Serve())
        this.plugins.push(new Pack())
    }


    private loadEnv() {
        const dirs = [this.context, this.root];
        dirs.forEach(dir => {
            const file = Path.resolve(dir, '.env')
            if (FS.existsSync(file)) {
                const env = dotenv.config({ path: file })
                dotenvExpand(env);
            }
        })
    }
    private loadUserWebpackConfig() {
        const configNames = [`./${ConfigWebpack}`];
        const ret = this._loadCode(configNames);
        if (ret) {
            const webpackCfg: UserWebpackConfig = ret as UserWebpackConfig;
            if (webpackCfg) {
                webpackCfg.plugins?.forEach(plugin => {
                    this.userWebpackConfig.plugins?.push(plugin)
                })
            }
        }
    }
    private loadUserOptions(): CocosPluginConfig | null {
        const configNames = ['./cc-plugin.config.js', `./${ConfigTypeScript}`];
        return this._loadCode(configNames);
    }
    private _loadCode(configNames: string[]) {
        let fileConfigPath = '';
        for (let name of configNames) {
            const fullPath = Path.join(this.context, name)
            if (FS.existsSync(fullPath)) {
                fileConfigPath = fullPath;
                break;
            }
        }
        if (fileConfigPath) {
            return this.loadModule(fileConfigPath);
        }
        return null
    }

    private loadModule(file: string) {
        // 从当前package的node_modules中找依赖
        prepare(extensions, file, this.root);
        const module = require(file);
        if (module.hasOwnProperty('default')) {
            return module.default;
        } else {
            return module;
        }
    }

    /**
     * @param name 校验是否在zh.ts,en.ts存在这个key
     */
    checkI18nKey(name: string) {
        const { i18n_en, i18n_zh } = this.projectConfig.manifest;
        this._checkI18nKey(i18n_en, name);
        this._checkI18nKey(i18n_zh, name);
    }
    private _checkI18nKey(i18nFile: string | undefined, key: string) {
        if (i18nFile) {
            const fullPath = Path.join(this.context, i18nFile);
            if (FS.existsSync(fullPath)) {
                const obj = this.loadModule(fullPath);
                if (obj && obj[key] === undefined) {
                    console.log(`not exist ${key} in ${i18nFile}`)
                }
            } else {
                console.log(`not exist i18n file:${i18nFile}`)
            }

        }
    }
    get defaults() {
        const options: CocosPluginOptions = DefaultCocosPluginOptions;
        const manifest: CocosPluginManifest = {
            name: 'cocos-creator-plugin',
            version: '0.0.0',
            main: './src/main.ts',
        }
        return { manifest, options, type: PluginType.Web };
    }

    public readyPlugins() {
        this.plugins.forEach((plugin) => {
            plugin.apply(this.pluginMgr, this);
        })
    }
    public init(type: PluginType) {
        this.loadEnv();
        const userOptions = this.loadUserOptions();
        userOptions && this.checkUserOptions(userOptions, type);
        this.projectConfig = defaultsDeep(userOptions, this.defaults);
        this.projectConfig.type = type;
        this.loadUserWebpackConfig();
        this.checkConfig();

    }
    // 校验插件配置
    private checkConfig() {
        if (this.projectConfig.type === PluginType.Chrome) {
            if (!this.projectConfig.manifest.chrome) {
                log.red('chrome插件需要配置manifest.chrome字段');
                process.exit(0);
            }
        }
    }

    public checkIsProjectDir(projDir: string) {
        // 必须存在这个目录
        const needDirs = ['assets'];
        let isProject = true;

        for (let i = 0; i < needDirs.length; i++) {
            const dir = needDirs[i];
            const assets = Path.join(projDir, dir)
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

    private catchOutput(type: PluginType, projectDir: string, pluginDir: string, pluginName: string) {
        // chrome
        if (type === PluginType.Chrome) {
            return projectDir;
        }

        if (projectDir.startsWith('./')) {
            // 相对目录，不检查是否为creator项目
            const output = Path.join(this.context, projectDir);
            FsExtra.ensureDirSync(output);
            return output;
        } else {
            // 绝对路径
            let output = projectDir;
            if (this.checkIsProjectDir(projectDir)) {
                output = Path.join(projectDir, pluginDir, pluginName);
                if (!FS.existsSync(output)) {
                    log.yellow(`自动创建输出目录：${output}`)
                    FsExtra.ensureDirSync(output)
                }
            } else {
                log.yellow(`options.outputProject需要配置为有效的Creator项目目录：${projectDir}`);
                output = projectDir;
            }
            return output;
        }

    }

    getPluginDir(version: PluginType): string {
        if (version === PluginType.PluginV2) {
            return 'packages';
        } else if (version === PluginType.PluginV3) {
            return 'extensions';
        }
        return ""
    }

    private getConfigProjectPath(type: PluginType): string | null {
        let projectPath = null;
        const configFile = Path.join(this.context, ccpConfigJson);
        if (FS.existsSync(configFile)) {
            const cfg: { v2: string, v3: string, chrome: string } = JSON.parse(FS.readFileSync(configFile, 'utf-8'));
            switch (type) {
                case PluginType.PluginV2: {
                    projectPath = cfg.v2;
                    break;
                }
                case PluginType.PluginV3: {
                    projectPath = cfg.v3;
                    break;
                }
                case PluginType.Web: {
                    projectPath = cfg.chrome;
                }
            }
        }
        return projectPath;
    }
    private getFullPath(path: string) {
        if (path.startsWith('./')) {
            return Path.join(this.context, path);
        }
        // 必须先判断相对路径，因为existsSync会判断相对路径是否存在
        if (FS.existsSync(path)) {
            return path;
        }
        return null;
    }
    private checkUserOptions(userOptions: CocosPluginConfig, type: PluginType) {
        // 根据配置，将output目录统一变为绝对路径
        const { options, manifest } = userOptions;
        let { outputProject } = options;
        const pluginDir = this.getPluginDir(type!);
        if (typeof outputProject === 'object') {
            const { v2, v3, web, chrome } = outputProject!;
            if (type === PluginType.PluginV2 || type === PluginType.PluginV3 || type === PluginType.Chrome) {
                // 优先支持配置文件
                const cfgProject = this.getConfigProjectPath(type);
                let dirs: { url: string, source: string }[] = [];
                if (cfgProject) {
                    dirs.push({ url: cfgProject, source: ccpConfigJson })
                }
                // 其次支持cc-plugin.config.ts里面的配置
                if (v2 !== undefined && type === PluginType.PluginV2) {
                    dirs.push({ url: v2, source: ConfigTypeScript })
                }
                if (v3 !== undefined && type === PluginType.PluginV3) {
                    dirs.push({ url: v3, source: ConfigTypeScript });
                }
                if (chrome !== undefined && type === PluginType.Chrome) {
                    const url = this.getFullPath(chrome);
                    if (url) {
                        if (!FS.existsSync(url)) {
                            log.yellow(`auto create directory: ${url}`);
                            FsExtra.ensureDirSync(url);
                        }
                        dirs.push({ url, source: ConfigTypeScript });
                    }
                }
                if (dirs.length <= 0) {
                    log.red(`未配置options.outputProject`);
                } else {
                    for (let i = 0; i < dirs.length; i++) {
                        const { url, source } = dirs[i];
                        if (url) {
                            options.output = this.catchOutput(type, url, pluginDir!, manifest.name);
                            break;
                        } else {
                            log.blue(`[${source}]里面的输出目录无效：${url}`)
                        }
                    }
                }
            } else if (web && type === PluginType.Web) {
                let fullPath = Path.join(this.context, web);
                if (!FS.existsSync(fullPath)) {
                    log.yellow(`auto create directory: ${fullPath}`);
                    FsExtra.ensureDirSync(fullPath);
                }
                options.output = fullPath;
            }
        } else {
            options.output = this.catchOutput(type, outputProject, pluginDir!, manifest.name);
        }
        if (options.output && FS.existsSync(options.output)) {
            if (type === PluginType.Web || type === PluginType.Chrome) {
                // web不会有node_modules目录，所以直接清空
                FsExtra.emptyDirSync(options.output);
                log.yellow(`清空目录：${options.output}`);
            } else {
                // TODO: 删除非node_modules目录
            }
        } else {
            log.red(`options.outputProject配置无效:${options.output}`)
            process.exit(0);
        }
    }
}
export const cocosPluginService = new CocosPluginService(process.cwd());