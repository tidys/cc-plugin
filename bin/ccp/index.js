"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosCreatorPlugin = void 0;
const panel_1 = require("./panel");
class CocosCreatorPlugin {
    constructor() {
        this.manifest = null;
        this.options = null;
        this.Panel = null;
        this.wrapper = null;
    }
    init(manifest, options, wrapper) {
        this.manifest = manifest;
        this.options = options;
        this.wrapper = wrapper;
        this.Panel = new panel_1.Panel(this);
    }
}
exports.CocosCreatorPlugin = CocosCreatorPlugin;
const CCP = new CocosCreatorPlugin();
exports.default = CCP;
