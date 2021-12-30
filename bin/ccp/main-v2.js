"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.load = void 0;
const entry_main_1 = __importDefault(require("./entry-main"));
const client_socket_1 = __importDefault(require("./client-socket"));
// 这个port需要动态获取
const port = 2346;
const hot = true;
exports.load = (() => {
    var _a;
    console.log('load');
    if (hot) {
        let client = new client_socket_1.default();
        client.setReloadCallback(() => {
            const { name } = entry_main_1.default.manifest;
            // @ts-ignore
            const fsPath = Editor.url(`packages://${name}`);
            // @ts-ignore
            Editor.Package.reload(fsPath, () => {
                console.log('reload success');
            });
        });
        client.connect(port);
    }
    (_a = entry_main_1.default.wrapper) === null || _a === void 0 ? void 0 : _a.load();
    return 0;
});
exports.messages = ((_a = entry_main_1.default.wrapper) === null || _a === void 0 ? void 0 : _a.messages) || {};
