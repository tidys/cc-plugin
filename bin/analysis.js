"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analysis = void 0;
class Analysis {
    constructor(service) {
        this.service = service;
    }
    getTongJiNiaoCode(id) {
        if (!id) {
            return "";
        }
        if (!this.service.isWeb()) {
            return "";
        }
        const data = `<script type="text/javascript" src="//api.tongjiniao.com/c?_=${id}" async></script>`;
        return data;
    }
}
exports.Analysis = Analysis;
//# sourceMappingURL=analysis.js.map