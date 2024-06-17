"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const log_1 = require("../log");
const path_1 = require("path");
class Readme {
    constructor(service) {
        this.service = service;
    }
    apply(compiler) {
        compiler.hooks.afterDone.tap('npm-install', () => {
            const rootDir = compiler.options.output.path;
            const files = ['README.zh.md', 'README.en.md'];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const readme = (0, path_1.join)(this.service.context, file);
                if ((0, fs_1.existsSync)(readme)) {
                    const target = (0, path_1.join)(rootDir, file);
                    if ((0, fs_1.existsSync)(target)) {
                        (0, fs_1.unlinkSync)(target);
                    }
                    (0, fs_1.copyFileSync)(readme, target);
                    log_1.log.blue(`${file} has been copied to ${rootDir}`);
                }
                else {
                    log_1.log.yellow(`${file} not found, suggest provide it in ${this.service.context}`);
                }
            }
        });
    }
}
exports.default = Readme;
//# sourceMappingURL=readme.js.map