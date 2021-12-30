"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosCreatorPluginMain = void 0;
const panel_1 = require("./panel");
class CocosCreatorPluginMain {
    constructor() {
        this.manifest = null;
        this.options = null;
        this.Panel = new panel_1.Panel();
        this.wrapper = null;
    }
    init(config, wrapper) {
        this.manifest = config.manifest;
        this.options = config.options;
        this.wrapper = wrapper;
        this.Panel.setConfig(config);
    }
}
exports.CocosCreatorPluginMain = CocosCreatorPluginMain;
const CCP = new CocosCreatorPluginMain();
exports.default = CCP;
