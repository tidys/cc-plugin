"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_api_1 = require("../plugin-api");
const Fs = __importStar(require("fs"));
const Path = __importStar(require("path"));
const log_1 = require("../log");
const FsExtra = __importStar(require("fs-extra"));
const tool_1 = require("./tool");
class Create extends plugin_api_1.PluginApi {
    apply(api, service) {
        api.registerCommand('create', {
            description: '创建项目',
            arguments: [
                { name: 'name', desc: '项目名字', required: false, value: "ccp-plugin" }
            ],
            options: [
                { name: '--override', desc: "强制覆盖当前目录" },
                { name: '--clean', desc: '清空目录' }
            ]
        }, (projectName, opts) => {
            const projectDir = Path.join(service.context, projectName);
            if (Fs.existsSync(projectDir)) {
                if (opts.override) {
                }
                else {
                    log_1.log.red(`目录已经存在：${projectDir}`);
                    return;
                }
                if (opts.clean) {
                    FsExtra.emptydirSync(projectDir);
                }
            }
            const templateDir = Path.join(service.root, './template/project');
            FsExtra.copySync(templateDir, projectDir);
            log_1.log.green('生成模板成功');
            // npmInstall(projectDir)
            tool_1.showWeChatQrCode();
        });
    }
}
exports.default = Create;
;
