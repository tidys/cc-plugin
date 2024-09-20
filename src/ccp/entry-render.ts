import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginType
} from '../declare';

import adaptation, { Adaptation } from './adaptation/index';
import profile from './profile';
import { ClientSocket } from './client-socket';
import { flag } from '../common'
interface PanelOptions {
    ready: (rootElement: any, args: any) => void;
    /**
     * 插件面板接受的主进程消息
     */
    messages?: Record<string, (event: any, data: any) => void>;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = adaptation;

    /**
     * 调用来自插件, export的正好是PanelOptions，和creator插件对上了
     */
    public init(config: CocosPluginConfig, options: PanelOptions): PanelOptions {
        this.Adaptation.init(config);
        this.manifest = config.manifest;
        this.options = Object.assign(DefaultCocosPluginOptions, config.options);
        profile.init({}, config);
        const { enabled, port, creatorHMR } = this.options.server!;
        if (enabled && creatorHMR) {
            let hot = () => {
                if (this.Adaptation.Env.isWeb || this.Adaptation.Env.isChrome) {
                    console.log('TODO web reload');
                } else {
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
        if (this.Adaptation.Env.isWeb || this.Adaptation.Env.isChrome || this.Adaptation.Env.isElectron) {
            let el = document.body.querySelector('#app');
            if (el && options.ready) {
                options.ready(el, null);
            }
        }
        if (this.Adaptation.Env.isPluginV3) {
            if (!options.messages) {
                options.messages = {}
            }
            if (options.messages.hasOwnProperty(flag)) {
                console.error(`don't define ${flag} in messages`);
            }
            options.messages[flag] = (functionName: string, data: any) => {
                if (options.messages) {
                    const func = options.messages[functionName];
                    if (func) {
                        func(null, data);
                    }
                }
            };
        }

        return options;
    }

    public builder() {

    }
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
