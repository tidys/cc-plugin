"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.load = void 0;
const index_1 = __importDefault(require("./index"));
exports.load = ((_a = index_1.default.wrapper) === null || _a === void 0 ? void 0 : _a.load) || (() => {
    console.log('load');
    return 0;
});
exports.messages = ((_b = index_1.default.wrapper) === null || _b === void 0 ? void 0 : _b.messages) || {};
