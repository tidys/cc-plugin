import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginVersion } from '../declare';
import ClientSocket from './client-socket';

import { Port } from './index'
import adaptation, { Adaptation } from './adaptation';

interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = adaptation;
    public isV2: boolean = true;

    public init(config: CocosPluginConfig, options: PanelOptions) {
        this.isV2 = config.options.version === PluginVersion.v2;
        this.Adaptation.init(config, this.isV2);
        this.manifest = config.manifest;
        this.options = config.options;
        // hot
        if (this.options?.hot) {
            let hot = () => {
                let client = new ClientSocket();
                client.setReloadCallback(() => {
                    // TODO 渲染进程HMR实现
                    console.log('reload')
                    // window.location.reload();// 这种方式会导致chrome也打开网页
                    // @ts-ignore
                    const electron = require('electron')
                    // @ts-ignore
                    electron.remote.getCurrentWindow().reload()
                })
                client.connect(Port)
            }
            const originReady = options.ready || (() => {});
            options.ready = (rootElement, args) => {
                hot();
                originReady(rootElement, args);
            }
        }
        return options;
    }

    public builder(){

    }
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
