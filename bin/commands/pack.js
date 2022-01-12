"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_api_1 = require("../plugin-api");
const webpack_1 = __importDefault(require("webpack"));
const log_1 = require("../log");
const zip_1 = __importDefault(require("../plugin/zip"));
class Pack extends plugin_api_1.PluginApi {
    exit() {
        process.exit(0);
    }
    apply(api, service) {
        api.registerCommand('pack', { description: '打包插件' }, (param) => {
            api.chainWebpack((webpackChain) => __awaiter(this, void 0, void 0, function* () {
                webpackChain.mode('production');
                webpackChain.devtool(false);
                const name = service.projectConfig.manifest.name;
                webpackChain.plugin('zip').use(zip_1.default, [name]);
            }));
            const webpackConfig = api.resolveChainWebpackConfig();
            webpack_1.default(webpackConfig, ((err, stats) => {
                if (err) {
                    return this.exit();
                }
                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                    stats === null || stats === void 0 ? void 0 : stats.compilation.errors.forEach(error => {
                        log_1.log.yellow(error.message);
                        log_1.log.blue(error.details);
                        log_1.log.red(error.stack || '');
                    });
                    return this.exit();
                }
                log_1.log.green('打包成功');
            }));
        });
    }
}
exports.default = Pack;
