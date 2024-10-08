"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronPackageJson = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
class ElectronPackageJson {
    constructor(service) {
        this.bProduction = false;
        this.service = service;
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('ChromeManifest', (compilation) => {
            this.bProduction = compilation.compiler.options.mode === "production";
            this.buildPkgJson();
        });
    }
    buildPkgJson() {
        const data = {
            main: "./main.js",
        };
        this.savePkgJson(data);
    }
    savePkgJson(data) {
        const options = this.service.projectConfig.options;
        const packageJsonFile = (0, path_1.join)(options.output, 'package.json');
        let spaces = options.min ? 0 : 4;
        if (this.bProduction) {
            spaces = 0;
        }
        (0, fs_extra_1.writeJSONSync)(packageJsonFile, data, { spaces });
    }
}
exports.ElectronPackageJson = ElectronPackageJson;
//# sourceMappingURL=package.json.js.map