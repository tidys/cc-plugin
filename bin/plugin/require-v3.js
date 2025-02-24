"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const declare_1 = require("../declare");
const webpack_sources_1 = require("webpack-sources");
const code = `(function (){
    // 防止使用编辑器自带的package报错
    const Path = require('path')
    module.paths.push(Path.join(Editor.App.path,'node_modules'));
})();\n`;
const floatingCode = `(function(){
        const {ipcRenderer} = require("electron");
        const {join} = require("path");
        const p = ipcRenderer.sendSync('${declare_1.IpcMsg.EditorNodeModules}');
        if (p) {
            module.paths.push(p);
        }
    })();\n`;
class RequireV3 {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.emit.tap('require-v3', (compilation) => {
            const { options } = this;
            const { assets } = compilation;
            Object.keys(assets).forEach(e => {
                if (/\.js$/.test(e)) {
                    if (e.startsWith(declare_1.Panel.Type.Floating)) {
                        // @ts-ignore
                        assets[e] = new webpack_sources_1.ConcatSource(floatingCode, assets[e]);
                    }
                    else {
                        // @ts-ignore
                        assets[e] = new webpack_sources_1.ConcatSource(code, assets[e]);
                    }
                }
            });
        });
    }
}
exports.default = RequireV3;
//# sourceMappingURL=require-v3.js.map