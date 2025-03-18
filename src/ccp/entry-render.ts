import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    Panel,
    PluginType
} from '../declare';

import { Adaptation } from './adaptation/index';
import profile from './profile';
import { ClientSocket } from './client-socket';
import { flag } from '../common'
import { ChromeConst, ChromePanelMsg } from '../chrome/const'
import { GoogleAnalytics } from './google-analytics';
import { mcp, Mcp } from './mcp';
interface PanelOptions {
    ready: (rootElement: any, args: {
        /**
         * chrome插件的devtools会创建2个，需要对shown的devtool面板进行vue渲染，所以特别传递了body参数
         */
        body?: HTMLElement,
        doc?: Document,
        win?: Window,
    }) => void;
    /**
     * 插件面板接受的主进程消息
     */
    messages?: Record<string, (event: any, data: any) => void>;
}

export class CocosCreatorPluginRender {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = new Adaptation();
    public GoogleAnalytics: GoogleAnalytics = new GoogleAnalytics();
    /**
     * 方便用户持有，在渲染进程进程链接mcp服务器
     */
    public mcp: Mcp = mcp;
    /**
     * 调用来自插件, export的正好是PanelOptions，和creator插件对上了
     */
    public init(config: CocosPluginConfig, options: PanelOptions): PanelOptions {
        this.Adaptation.init(config);
        if (config.manifest.analysis?.googleAnalytics) {
            const { apiSecret, measurementID } = config.manifest.analysis.googleAnalytics;
            if (apiSecret && measurementID) {
                this.GoogleAnalytics.initID(apiSecret, measurementID);
            }
        }
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
        if (typeof __PANEL__ !== 'undefined' && __PANEL__.type === Panel.Type.Floating) {
            // 渲染进程是肯定有__PANEL__的全局变量，Floating类型面板需要时机处理vue渲染
            this.runInWeb(config, options);
        } else if (this.Adaptation.Env.isWeb || this.Adaptation.Env.isElectron) {
            this.runInWeb(config, options);
        } else if (this.Adaptation.Env.isChrome) {
            const fn = chrome?.devtools?.panels?.create;
            if (!!fn) {
                this.runInChromeExtension(config, options);
            } else {
                // chrome web test env
                this.runInWeb(config, options);
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
    private runInWeb(config: CocosPluginConfig, options: PanelOptions) {
        let el = document.body.querySelector('#app');
        if (el && options.ready) {
            options.ready(el, {});
        }
    }
    private runInChromeExtension(config: CocosPluginConfig, options: PanelOptions) {
        let iconPath = "";
        const { icon } = config.manifest;
        if (icon && icon["48"]) {
            iconPath = icon["48"];
        }
        let hasInit = false;
        let curWin: Window | null = null;
        chrome.devtools.panels.create(config.manifest.name, iconPath, ChromeConst.html.devtools, (panel: chrome.devtools.panels.ExtensionPanel) => {
            panel.onShown.addListener((win) => {
                curWin = win;
                // 因为chrome会创建一个隐藏的devtools.html，所以需要标记下
                win['devtools_panel'] = win.document['devtools_panel'] = true;
                if (hasInit) {
                    const event = new CustomEvent(ChromePanelMsg.Show, {});
                    win.dispatchEvent(event);
                } else {
                    hasInit = true;
                    let el = win.document.body.querySelector('#app');
                    if (el && options.ready) {
                        // 给元素增加一个属性，好辨认
                        [win.document.body, win.document.body.parentElement, el].forEach((element) => {
                            if (element) {
                                element.setAttribute('devtools_panel', "");
                            }
                        })
                        options.ready(el, {
                            win: win,
                            body: win.document.body,
                            doc: win.document,
                        });
                    }
                }
            })
            panel.onHidden.addListener(() => {
                if (curWin) {
                    const event = new CustomEvent(ChromePanelMsg.Show, {});
                    curWin.dispatchEvent(event);
                }
            })
            panel.onSearch.addListener((query) => {
                if (curWin) {
                    const event = new CustomEvent(ChromePanelMsg.Search, { detail: query });
                    curWin.dispatchEvent(event);
                }
            })
        })
    }
    public builder() {

    }
}

const CCP = new CocosCreatorPluginRender();
export default CCP;
