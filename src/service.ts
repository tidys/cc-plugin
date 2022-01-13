import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginVersion
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
import chalk from 'chalk';
import { log } from './log';
import { PluginCmdCallback, PluginCmdOptions, PluginMgr } from './plugin-mgr';
import Config from 'webpack-chain';
import { program } from 'commander';
import Create from './commands/create';
import * as FsExtra from 'fs-extra'

export interface ProjectConfig {
    manifest: CocosPluginManifest,
    options: CocosPluginOptions,
}

export default class CocosPluginService {
    public webpackChainFns: Function[] = [];
    public plugins: PluginApi[] = [];
    public context: string;
    public root: string;
    public projectConfig: ProjectConfig = this.defaults;
    public pluginMgr: PluginMgr;

    constructor(context: string) {
        this.pluginMgr = new PluginMgr(this);
        this.context = context || process.cwd();
        this.root = Path.join(__dirname, '..')
        this.resolvePlugins();
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

    private loadUserOptions(): CocosPluginConfig | null {
        const configNames = ['./cc-plugin.config.js', './cc-plugin.config.ts'];
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
        prepare(extensions, file);
        const module = require(file);
        if (module.hasOwnProperty('default')) {
            return module.default;
        } else {
            return module;
        }
    }

    get defaults() {
        const options: CocosPluginOptions = DefaultCocosPluginOptions;
        const manifest: CocosPluginManifest = {
            name: 'cocos-creator-plugin',
            version: '0.0.0',
            main: './src/main.ts',
        }
        return { manifest, options };
    }


    private init() {
        this.loadEnv();
        const userOptions = this.loadUserOptions();
        userOptions && this.checkUserOptions(userOptions);
        this.projectConfig = defaultsDeep(userOptions, this.defaults);
        this.plugins.forEach((plugin) => {
            plugin.apply(this.pluginMgr, this);
        })
    }

    private checkIsProjectDir(projDir: string) {
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

    private catchOutput(projectDir: string, pluginDir: string, pluginName: string) {
        // 相对目录
        if (projectDir.startsWith('./')) {
            log.red(`options.outputProject 暂时不支持相对目录的写法：${projectDir}`)
            process.exit(0)
        }
        let output = projectDir;
        if (this.checkIsProjectDir(projectDir)) {
            output = Path.join(projectDir, pluginDir, pluginName);
            if (!FS.existsSync(output)) {
                log.yellow(`自动创建输出目录：${output}`)
                FsExtra.ensureDirSync(output)
            }
        } else {
            log.yellow(`options.outputProject需要配置为Creator生成的项目目录：${projectDir}`);
            output = projectDir;
        }
        return output;
    }

    getPluginDir(version: PluginVersion) {
        if (version === PluginVersion.v2) {
            return 'packages';
        } else if (version === PluginVersion.v3) {
            return 'extensions';
        }
    }

    private checkUserOptions(userOptions: CocosPluginConfig) {
        // 根据配置，将output目录统一变为绝对路径
        const { options, manifest } = userOptions;
        let { version, outputProject } = options;
        const pluginDir = this.getPluginDir(version!);
        if (typeof outputProject === 'object') {
            const { v2, v3 } = outputProject!;
            if (v2 && version === PluginVersion.v2) {
                options.output = this.catchOutput(v2, pluginDir!, manifest.name);
            } else if (v3 && version === PluginVersion.v3) {
                options.output = this.catchOutput(v3, pluginDir!, manifest.name);
            }
        } else {
            options.output = this.catchOutput(outputProject, pluginDir!, manifest.name);
        }
        if (!options.output) {
            log.red(`无效的output：${options.output}`)
        }
        if (!FS.existsSync(options.output as string)) {
            log.red(`options.outputProject目录不存在：${options.output}`)
            process.exit(0);
        }
    }

    run() {
        this.init();
    }
}
