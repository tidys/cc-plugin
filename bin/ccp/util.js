"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.url = exports.log = void 0;
function log(str) {
    // @ts-ignore
    Editor.log(str);
}
exports.log = log;
function url(string) {
    // @ts-ignore
    return Editor.url(string);
}
exports.url = url;
