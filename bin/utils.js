"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    constructor() {
        this.manifest = null;
        this.options = null;
    }
    init(manifest, options) {
        this.manifest = manifest;
        this.options = options;
    }
    i18n(key) {
        const pkgName = this.manifest.name;
        return `i18n:${pkgName}.${key}`;
    }
}
const utils = new Utils();
exports.default = utils;
