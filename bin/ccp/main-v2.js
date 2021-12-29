"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.load = void 0;
const index_1 = __importDefault(require("./index"));
const client_socket_1 = __importDefault(require("./client-socket"));
// 这个port需要动态获取
const port = 2346;
const hot = true;
exports.load = (() => {
    var _a;
    console.log('load');
    if (hot) {
        let client = new client_socket_1.default();
        client.connect(port);
    }
    (_a = index_1.default.wrapper) === null || _a === void 0 ? void 0 : _a.load();
    return 0;
});
exports.messages = ((_a = index_1.default.wrapper) === null || _a === void 0 ? void 0 : _a.messages) || {};
