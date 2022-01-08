import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginVersion } from './declare';

import * as Path from 'path';
import serve from './commands/serve'
import { PluginApi } from './plugin-api';
import { defaultsDeep } from 'lodash'
import * as FS from 'fs';
import { extensions } from 'interpret'
import { prepare } from 'rechoir'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import chalk from 'chalk';

export interface ServiceCommands {
    fn: Function,
    opts: Object,
}

interface ServicePlugins {
    id: string;
    apply: (api: PluginApi, options: ProjectConfig) => void;
}

export interface ProjectConfig {
    manifest: CocosPluginManifest,
    options: CocosPluginOptions,
}

export default class CocosPluginService {
    public webpackChainFns: Function[] = [];
    public commands: Record<string, ServiceCommands> = {};
    public plugins: ServicePlugins[] = [];
    public context: string;
    public root: string;
    public projectConfig: ProjectConfig = this.defaults;

    constructor(context: string) {
        this.context = context || process.cwd();
        this.root = Path.join(__dirname, '..')
        this.resolvePlugins();
    }

    private resolvePlugins() {
        this.plugins.push({ id: 'serve', apply: serve })
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
        const options: CocosPluginOptions = {
            output: './dist',
            version: PluginVersion.v2,
            min: false,
        };
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
        this.plugins.forEach(({ id, apply }) => {
            apply(new PluginApi(id, this), this.projectConfig)
        })
    }

    private checkUserOptions(userOptions: CocosPluginConfig) {
        // 根据配置，将output目录统一变为绝对路径
        const { options } = userOptions;
        let { output, version } = options;
        if (typeof output === 'object') {
            const { v2, v3 } = output;
            if (v2 && version === PluginVersion.v2) {
                options.output = v2;
            }
            if (v3 && version === PluginVersion.v3) {
                options.output = v3;
            }
        }
        if (!options.output) {
            console.log(chalk.red(`无效的output：${options.output}`));
        }
        if (!FS.existsSync(options.output as string)) {
            console.log(chalk.yellow(`output不存在：${options.output}`))
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
