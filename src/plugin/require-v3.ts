import { Panel } from '../declare';
import webpack from 'webpack';
import { ConcatSource } from 'webpack-sources'

const code =
    `(function (){
    // 防止使用编辑器自带的package报错
    const Path = require('path')
    // @ts-ignore
    module.paths.push(Path.join(Editor.App.path,'node_modules'));
})();\n`
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
                if (/\.js$/.test(e) && !e.startsWith(Panel.Type.Floating)) {
                    // @ts-ignore
                    assets[e] = new ConcatSource(code, assets[e]);
                }
            })
        })
    }
}


