import { IpcMsg, Panel } from '../declare';
import webpack from 'webpack';
import { ConcatSource } from 'webpack-sources'

const code =
    `(function (){
    // 防止使用编辑器自带的package报错
    const Path = require('path')
    module.paths.push(Path.join(Editor.App.path,'node_modules'));
})();\n`;
const floatingCode =
    `(function(){
        const {ipcRenderer} = require("electron");
        const {join} = require("path");
        const p = ipcRenderer.sendSync('${IpcMsg.EditorNodeModules}');
        if (p) {
            module.paths.push(p);
        }
    })();\n`;
export default class RequireV3 {
    private options: any;

    constructor(options: string) {
        this.options = options;
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.emit.tap('require-v3', (compilation: webpack.Compilation) => {
            const { options } = this;
            const { assets } = compilation;

            Object.keys(assets).forEach(e => {
                if (/\.js$/.test(e)) {
                    if (e.startsWith(Panel.Type.Floating)) {
                        // @ts-ignore
                        assets[e] = new ConcatSource(floatingCode, assets[e]);
                    } else {
                        // @ts-ignore
                        assets[e] = new ConcatSource(code, assets[e]);
                    }
                }
            })
        })
    }
}


