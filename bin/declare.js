"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPluginPanel = exports.PluginVersion = exports.Panel = void 0;
exports.Panel = {
    Type: {
        Dockable: 'dockable',
    },
};
var PluginVersion;
(function (PluginVersion) {
    PluginVersion[PluginVersion["v2"] = 0] = "v2";
    PluginVersion[PluginVersion["v3"] = 1] = "v3";
})(PluginVersion = exports.PluginVersion || (exports.PluginVersion = {}));
class AbstractPluginPanel {
}
exports.AbstractPluginPanel = AbstractPluginPanel;
