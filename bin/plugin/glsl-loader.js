"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 加载glsl的loader，本质上还是加载文件内容
// 参考的文章：https://juejin.cn/post/6844904054393405453
// https://github.com/webpack-contrib/json-loader/blob/master/index.js
const loader_utils_1 = require("loader-utils");
function default_1(source, map) {
    // @ts-ignore fixme 类型对不上
    const opts = loader_utils_1.getOptions(this) || {};
    let isESM = true;
    if (typeof opts.esModule !== "undefined") {
        isESM = !!opts.esModule;
    }
    if (isESM) {
        source = `export default \`${source}\``;
    }
    else {
        source = `module.exports = \`${source}\``;
    }
    // @ts-ignore fixme 类型对不上
    this.callback(null, source, map);
}
exports.default = default_1;
//# sourceMappingURL=glsl-loader.js.map