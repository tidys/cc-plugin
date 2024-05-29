import { PluginCmdOptions } from "plugin-mgr";
import Config from "webpack-chain";
import webpack, { cache } from 'webpack'
import { PluginType } from "../declare";
import { OptionValues } from "commander";

export function getBuildOptions(name: string): PluginCmdOptions {
    return {
        description: name,
        arguments: [
            { name: "type", desc: "构建的类型", required: false, },
        ],
        options: [
            { name: '--validCode <string>', desc: "设置有效代码的变量值, 当为false时可以将这部分的代码剔除掉" }
        ]
    }
}

export class BuildOptions {
    public type: string = "web";
    public validCode: boolean = true
}
export function parseBuildOptions(webpackChain: Config, type: string, options: OptionValues) {
    let validCode = true;
    try {
        const v = options.validCode;
        if (typeof v === 'string') {
            validCode = JSON.parse(v);
        }
    } catch (e) {

    }

    webpackChain.plugin("buildVariables",)
        .use(webpack.DefinePlugin, [{
            __VALID_CODE__: validCode,
            __PLUGIN_TYPE__: JSON.stringify(type),
        }]);
}
export function defineVar(webpackChain: Config, dev: boolean = false, workspaceDir: string = "") {
    const dir = `"${workspaceDir.replace(/\\/g, '/')}"`
    webpackChain.plugin("build_dev_variables",)
        .use(webpack.DefinePlugin, [{
            __DEV__: !!dev,
            __DEV_WORKSPACE__: dir,
        }]);
}

export function checkBuildType(type: string, exit: boolean = false) {
    if (type === PluginType.PluginV2 ||
        type === PluginType.PluginV3 ||
        type === PluginType.Chrome ||
        type == PluginType.Web) {
        return true;
    }
    if (exit) {
        console.log(`不支持的构建类型${type}`)
        process.exit(-1);
    } else {
        return false;
    }
}