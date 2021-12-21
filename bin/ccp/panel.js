"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
const declare_1 = require("../declare");
class Panel {
    constructor(plugin) {
        this.plugin = null;
        this.plugin = plugin;
    }
    open(panel) {
        var _a;
        const array = panel.split('.');
        if (array.length >= 2) {
            let [panelName, panelID] = array;
            const { manifest, options } = this.plugin;
            if ((options === null || options === void 0 ? void 0 : options.version) === declare_1.PluginVersion.v2) {
                if (panelName === 'self') {
                    panelName = manifest.name;
                    // 查找panelID是否存在
                    if (!((_a = manifest === null || manifest === void 0 ? void 0 : manifest.panels) === null || _a === void 0 ? void 0 : _a.find(el => el.name === panelID))) {
                        console.error(`open failed: ${panel}`);
                        return;
                    }
                }
                //@ts-ignore
                Editor.Panel.open(`${panelName}.${panelID}`);
            }
        }
    }
    close() {
    }
}
exports.Panel = Panel;
