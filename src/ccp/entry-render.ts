import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginType
} from '../declare';

import adaptation, {Adaptation} from './adaptation';

interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = adaptation;
    public isV2: boolean = true;

    public init(config: CocosPluginConfig, options: PanelOptions) {
        this.isV2 = config.options.type === PluginType.PluginV2;
        this.Adaptation.init(config, this.isV2);
        this.manifest = config.manifest;
        this.options = Object.assign(DefaultCocosPluginOptions, config.options);

        const { enabled, port } = this.options.server!;
        if (enabled) {
            let hot = () => {
                if (this.options.type === PluginType.Web) {
                    console.log('TODO web reload');
                } else {
                    const ClientSocket = require('./client-socket');
                    let client = new ClientSocket();
                    client.setReloadCallback(() => {
                        // TODO 渲染进程HMR实现
                        console.log('reload')

                        if (this.isV2) {

                        } else {

                        }
                        // window.location.reload();// 这种方式会导致chrome也打开网页
                        // @ts-ignore
                        const electron = require('electron')
                        // @ts-ignore
                        electron.remote.getCurrentWindow().reload()
                    })
                    client.connect(port!)
                }
            }
            const originReady = options.ready || (() => {
            });
            options.ready = (rootElement, args) => {
                hot();
                originReady(rootElement, args);
            }
        }
        return options;
    }

    public builder() {

    }
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
