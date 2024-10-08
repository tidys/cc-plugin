"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBuildType = exports.defineVar = exports.parseBuildOptions = exports.BuildOptions = exports.getBuildOptions = void 0;
const webpack_1 = __importDefault(require("webpack"));
const declare_1 = require("../declare");
function getBuildOptions(name) {
    return {
        description: name,
        arguments: [
            { name: "type", desc: "构建的类型", required: false, },
        ],
        options: [
            { name: '--validCode <string>', desc: "设置有效代码的变量值, 当为false时可以将这部分的代码剔除掉" }
        ]
    };
}
exports.getBuildOptions = getBuildOptions;
class BuildOptions {
    constructor() {
        this.type = "web";
        this.validCode = true;
    }
}
exports.BuildOptions = BuildOptions;
function parseBuildOptions(webpackChain, type, options) {
    let validCode = true;
    try {
        const v = options.validCode;
        if (typeof v === 'string') {
            validCode = JSON.parse(v);
        }
    }
    catch (e) {
    }
    webpackChain.plugin("buildVariables")
        .use(webpack_1.default.DefinePlugin, [{
            __VALID_CODE__: validCode,
            __PLUGIN_TYPE__: JSON.stringify(type),
        }]);
}
exports.parseBuildOptions = parseBuildOptions;
function defineVar(webpackChain, dev = false, workspaceDir = "") {
    const dir = `"${workspaceDir.replace(/\\/g, '/')}"`;
    webpackChain.plugin("build_dev_variables")
        .use(webpack_1.default.DefinePlugin, [{
            __DEV__: !!dev,
            __DEV_WORKSPACE__: dir,
        }]);
}
exports.defineVar = defineVar;
function checkBuildType(type, exit = false) {
    if (type === declare_1.PluginType.PluginV2 ||
        type === declare_1.PluginType.PluginV3 ||
        type === declare_1.PluginType.Chrome ||
        type === declare_1.PluginType.Electron ||
        type == declare_1.PluginType.Web) {
        return true;
    }
    if (exit) {
        console.log(`不支持的构建类型${type}`);
        process.exit(-1);
    }
    else {
        return false;
    }
}
exports.checkBuildType = checkBuildType;
//# sourceMappingURL=commonOptions.js.map