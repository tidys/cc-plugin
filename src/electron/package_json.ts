import { writeJSONSync } from 'fs-extra';
import { join } from 'path';
import { CocosPluginService } from 'service';
import webpack from 'webpack';
export class ElectronPackageJson {

    private service;
    constructor(service: CocosPluginService) {
        this.service = service;
    }
    private bProduction: boolean = false;
    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tap('ChromeManifest', (compilation: webpack.Compilation) => {
            this.bProduction = compilation.compiler.options.mode === "production";
            this.buildPkgJson();
        })
    }
    private buildPkgJson() {
        const data = {
            main: "./main.js",
        }
        this.savePkgJson(data)
    }
    private savePkgJson(data: any) {
        const options = this.service.projectConfig.options!;
        const packageJsonFile = join(options.output! as string, 'package.json');
        let spaces = options.min ? 0 : 4;
        if (this.bProduction) {
            spaces = 0;
        }
        writeJSONSync(packageJsonFile, data, { spaces });
    }
}