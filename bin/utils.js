"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const declare_1 = require("./declare");
class Utils {
    constructor() {
        this.manifest = null;
        this.options = null;
        // 内置的菜单
        this.builtinMenu = {
            project: '',
        };
    }
    init(manifest, options) {
        this.manifest = manifest;
        this.options = options;
        const { version } = options;
        if (version === declare_1.PluginVersion.v2) {
            this.builtinMenu.project = this.toi18n('MAIN_MENU.project.title');
        }
        else if (version === declare_1.PluginVersion.v3) {
            this.builtinMenu.project = this.toi18n('menu.project');
        }
    }
    i18n(key) {
        const pkgName = this.manifest.name;
        return this.toi18n(`${pkgName}.${key}`);
    }
    toi18n(key) {
        return `i18n:${key}`;
    }
}
const utils = new Utils();
exports.default = utils;
