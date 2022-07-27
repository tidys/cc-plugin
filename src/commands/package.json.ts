import webpack from 'webpack';
import { CocosPluginV2, CocosPluginV3, PluginType } from '../declare';
import Path from 'path';
import * as FsExtra from 'fs-extra';
import CocosPluginService from '../service';
import { PackageInterface, PackageV2, PackageV3 } from './package-worker';


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
        let packageJson: CocosPluginV2 | CocosPluginV3 = {
            name: this.manifest.name,
            version: this.manifest.version,
            description: this.manifest.description || '',
            author: this.manifest.author || 'cocos-plugin-cli',
            main: './main.js',
        };
        const { type } = this.options;

        let packageWorker: PackageInterface | null = null;
        if (type === PluginType.PluginV2) {
            packageWorker = new PackageV2(this.service.projectConfig, packageJson);
        } else if (type === PluginType.PluginV3) {
            packageWorker = new PackageV3(this.service.projectConfig, packageJson);
        }
        // 面板
        packageWorker?.panelReady();
        this.manifest.panels?.map((panel) => {
            packageWorker?.panelBuild(panel);
        })
        // 菜单
        packageWorker?.menuReady();
        this.manifest.menus?.map((menu) => {
            packageWorker?.menuBuild(menu);
        })
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
                    const dependencies = data['dependencies']
                    for (let key in dependencies) {
                        if (key.endsWith('.js')) {
                            delete dependencies[key]
                        }
                    }
                    return dependencies;
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    private _savePackageJsonFile(data: CocosPluginV2) {
        const options = this.service.projectConfig.options!;
        const packageJsonFile = Path.join(options.output! as string, 'package.json');
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
