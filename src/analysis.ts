import { CocosPluginService } from "./service";

export class Analysis {
    private service: CocosPluginService;
    constructor(service: CocosPluginService) {
        this.service = service;
    }
    getTongJiNiaoCode(id: string): string[] {
        if (!id) {
            return [];
        }
        if (!this.service.isWeb()) {
            return [];
        }
        const data = `<script type="text/javascript" src="//api.tongjiniao.com/c?_=${id}" async></script>`
        return [data];
    }
    /**
     * 一般来说这个统计代码不会变化
     */
    getGoogleAnalyticsCode(id: string): string[] {
        const data: string[] = [];
        data.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`)
        data.push(`<script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}; gtag('js', new Date()); gtag('config', '${id}'); </script>`);
        return data;
    }
}
