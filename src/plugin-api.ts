import CocosPluginService from './service';
import Chain from 'webpack-chain'

export class PluginApi {
    private id: string;
    private service: CocosPluginService;

    constructor(id: string, service: CocosPluginService) {
        this.id = id;
        this.service = service;
    }

    registerCommand(name: string, opts: Function | Object, fn: Function) {
        if (typeof opts === 'function') {
            fn = opts;
            opts = {};
        }
        this.service.commands[name] = { fn, opts: opts }
    }

    chainWebpack(fn: (config: any) => void) {
        this.service.webpackChainFns.push(fn);
    }

    resolveChainWebpackConfig() {
        const config = new Chain();
        this.service.webpackChainFns.forEach(fn => {
            fn(config);
        })
        return config.toConfig();
    }
}
