import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginVersion } from '../declare';
import ClientSocket from './client-socket';
import { Panel } from './panel'

import { Port } from './index'
import { requireWithUrl, urlToFsPath } from './require-v3';

interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Panel: Panel = new Panel();

    url(url: string) {
        if (this.isV2) {
            // @ts-ignore
            return Editor.url(string)
        } else {
            return urlToFsPath(url);
        }
    }

    get isV2() {
        const { version } = this.options!;
        return version === PluginVersion.v2;
    }

    require(name: string): any {

        if (this.isV2) {
            // @ts-ignore
            return Editor.require(`packages://${this.manifest!.name}/node_modules/${name}`)
        } else {
            return requireWithUrl(`packages://${this.manifest!.name}/node_modules/${name}`)
        }
    }

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
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
