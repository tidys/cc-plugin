"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromeConst = void 0;
exports.ChromeConst = {
    script: {
        background: 'background.js',
        content: 'content.js',
        /**
         * inject.js脚本是由content.js进行注入的
         */
        inject: 'inject.js',
    },
    html: {
        options: 'options.html',
        popup: 'popup.html',
        devtools: 'devtools.html',
    }
};
//# sourceMappingURL=const.js.map