import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginVersion } from '../declare';
import ClientSocket from './client-socket';
import { Panel } from './panel'

import { Port } from './index'
import * as Path from 'path';

interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Panel: Panel = new Panel();

    require(name: string): any {
        const { version } = this.options!;

        if (version === PluginVersion.v2) {
            // @ts-ignore
            return Editor.require(`packages://${this.manifest!.name}/node_modules/${name}`)
        } else if (version === PluginVersion.v3) {
            // @ts-ignore
            let editorModules = Path.join(Editor.App.path, 'node_modules');
            module.paths.push(editorModules);
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
