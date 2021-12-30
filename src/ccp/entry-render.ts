import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginMainWrapper } from '../declare';
import ClientSocket from './client-socket';
import { Panel } from './panel'

import { Port } from './index'

interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Panel: Panel = new Panel();


    public init(config: CocosPluginConfig, options: PanelOptions) {
        this.Panel.setConfig(config);
        this.manifest = config.manifest;
        this.options = config.options;
        // hot
        if (this.options?.hot) {
            let hot = () => {
                let client = new ClientSocket();
                client.setReloadCallback(() => {
                    // TODO 渲染进程HMR实现
                    window.location.reload();
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
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
