import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginType
} from '../declare';

import adaptation, { Adaptation } from './adaptation';
import profile from './profile';

interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = adaptation;

    public init(config: CocosPluginConfig, options: PanelOptions) {
        const { type } = config.options;
        this.Adaptation.init(config, type || PluginType.PluginV2);
        this.manifest = config.manifest;
        this.options = Object.assign(DefaultCocosPluginOptions, config.options);
        profile.init({}, config);
        const { enabled, port } = this.options.server!;
        if (enabled) {
            let hot = () => {
                if (this.options?.type === PluginType.Web) {
                    console.log('TODO web reload');
                } else {
                    const ClientSocket = require('./client-socket').default;
                    let client = new ClientSocket();
                    client.setReloadCallback(() => {
                        // TODO 渲染进程HMR实现
                        console.log('reload')

                        if (this.Adaptation.Env.isPluginV2) {

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
        if (type === PluginType.Web) {
            let el = document.body.querySelector('#app');
            if (el && options.ready) {
                options.ready(el, null);
            }
        }
        return options;
    }

    public builder() {

    }
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
