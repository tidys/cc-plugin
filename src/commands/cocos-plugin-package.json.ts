import webpack from 'webpack';
import { CocosPluginManifest, CocosPluginOptions, CocosPluginV2, PanelOptions, PluginVersion } from '../declare';
import Path from 'path';
import * as FsExtra from 'fs-extra';
import CocosPluginService from '../service';

export default class CocosPluginPackageJson {
    private service;


    constructor(service: CocosPluginService) {
        this.service = service;
    }


    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tap('PackageJson', () => {
            this.buildPackageJsonFile();
        })
    }

    private buildPackageJsonFile() {

        let packageJson: CocosPluginV2 = {
            name: this.manifest.name,
            version: this.manifest.version,
            main: './main.js',
        };
        packageJson.description = this.manifest.description || '';
        packageJson.author = this.manifest.author || 'cocos-plugin-cli';

        this.manifest.panels?.map((panel) => {
            if (this.options.version === PluginVersion.v2) {
                const panelName = !!panel.name ? `panel.${panel.name}` : 'panel';
                if (!packageJson.hasOwnProperty(panelName)) {
                    // @ts-ignore
                    packageJson[`${panelName}`] = {
                        main: panel.main, // TODO 找到这个panel的main
                        title: panel.title,
                        type: panel.type,
                        width: panel.width,
                        height: panel.height,
                        'min-width': panel.minWidth,
                        'min-height': panel.minHeight,
                    }
                } else {
                    console.log('重复的panel')
                }
            }
        })
        if (this.manifest.menus?.length) {
            let menus: Record<string, { icon?: string, message?: string, accelerator?: string }> = packageJson['main-menu'] = {}
            this.manifest.menus?.map((menu) => {
                if (this.options.version === PluginVersion.v2) {
                    menus[menu.path] = { message: menu.message };
                }
            })
        }
        const dependencies = this.getDependencies();
        if (dependencies) {
            packageJson.dependencies = dependencies;
        }
        this._savePackageJsonFile(packageJson);
    }

    private getDependencies() {
        try {
            const file = Path.join(this.service.context, 'package.json');
            if (FsExtra.existsSync(file)) {
                const data = FsExtra.readJSONSync(file);
                if (data && data.hasOwnProperty('dependencies')) {
                    return data['dependencies']
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    private _savePackageJsonFile(data: CocosPluginV2) {
        const options = this.service.projectConfig.options!;
        const packageJsonFile = Path.join(options.output!, 'package.json');
        let spaces = options.min ? 0 : 4;
        FsExtra.writeJSONSync(packageJsonFile, data, { spaces });
    }

    private get manifest() {
        return this.service.projectConfig.manifest!;
    }

    private get options() {
        return this.service.projectConfig.options!;
    }
}
