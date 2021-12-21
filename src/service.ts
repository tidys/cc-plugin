import { CocosPluginManifest, CocosPluginOptions, PluginVersion } from './declare';

import * as Path from 'path';
import serve from './commands/serve'
import { PluginApi } from './plugin-api';
import { defaultsDeep } from 'lodash'
import * as FS from 'fs';
import { extensions } from 'interpret'
import { prepare } from 'rechoir'


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

    }

    private loadUserOptions(): { manifest: CocosPluginManifest, options: CocosPluginOptions } | null {
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
        this.projectConfig = defaultsDeep(userOptions, this.defaults);
        this.plugins.forEach(({ id, apply }) => {
            apply(new PluginApi(id, this), this.projectConfig)
        })
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
