import { CocosPluginService } from "./service";

export class Analysis {
    private service: CocosPluginService;
    constructor(service: CocosPluginService) {
        this.service = service;
    }
    getTongJiNiaoCode(id: string): string {
        if (!id) {
            return "";
        }
        if (!this.service.isWeb()) {
            return "";
        }
        const data = `<script type="text/javascript" src="//api.tongjiniao.com/c?_=${id}" async></script>`
        return data;
    }
}
