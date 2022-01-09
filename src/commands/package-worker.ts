import { CocosPluginConfig, CocosPluginV2, CocosPluginV3, MenuOptions, PanelOptions } from '../declare';
import { log } from '../log';
import { trim } from 'lodash'

export abstract class PackageInterface {
    protected config: CocosPluginConfig;

    constructor(config: CocosPluginConfig) {
        this.config = config;
    }

    menuReady() {};

    menuBuild(menu: MenuOptions) {};

    panelReady() {};

    panelBuild(panel: PanelOptions) {};
}

export class PackageV2 extends PackageInterface {
    private packageData: CocosPluginV2 | null = null;

    constructor(config: CocosPluginConfig, packageDta: CocosPluginV2) {
        super(config);
        this.packageData = packageDta;
    }

    menuReady() {
        super.menuReady();
        this.packageData!['main-menu'] = {};
    }

    menuBuild(menu: MenuOptions) {
        super.menuBuild(menu);
        let menus = this.packageData!['main-menu']!;
        const { name } = menu.message;
        const panel = menu.message.panel || this.config.manifest.name;
        menus[menu.path] = { message: `${panel}:${name}` };
    }

    panelReady() {
        super.panelReady();
    }

    panelBuild(panel: PanelOptions) {
        super.panelBuild(panel);
        const panelName = !!panel.name ? `panel.${panel.name}` : 'panel';
        if (!this.packageData!.hasOwnProperty(panelName)) {
            // @ts-ignore
            packageJson[`${panelName}`] = {
                main: panel.main,
                title: panel.title,
                type: panel.type,
                width: panel.width,
                height: panel.height,
                'min-width': panel.minWidth,
                'min-height': panel.minHeight,
            }
        } else {
            console.log('重复的panel')
        }
    }
}

export class PackageV3 extends PackageInterface {
    private packageData: CocosPluginV3 | null = null;

    constructor(config: CocosPluginConfig, packageData: CocosPluginV3) {
        super(config);
        this.packageData = packageData;
        this.packageData.package_version = 2;
    }


    panelReady() {
        super.panelReady();
    }

    panelBuild(panel: PanelOptions) {


    }

    menuReady() {
        super.panelReady();
        this.packageData!.contributions = {
            messages: {},
            menu: [],
            shortcuts: [],
        };
    }

    menuBuild(menuOpts: MenuOptions) {
        super.menuBuild(menuOpts);
        let menu = this.packageData!.contributions!.menu!;
        let msgKey = this.addMessage(menuOpts);
        let { newLabel, newPath } = this.dealPath(menuOpts.path);
        menu.push({
            path: newPath,
            label: newLabel,
            message: msgKey,
        })
    }

    private dealPath(path: string) {
        let newPath = '', newLabel = ''
        path = trim(path, '/')
        const items = path.split('/');
        if (items.length >= 2) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (i === items.length - 1) {
                    newLabel = item;
                } else {
                    newPath += item + '/';
                }
            }
        } else {
            const item = items[0];
            if (item) {
                newPath = newLabel = item;
            }
            log.yellow(`没有以/分割菜单，默认配置为`);
        }
        newPath = trim(newPath, '/');
        newLabel = trim(newLabel, '/')
        return { newLabel, newPath };
    }

    private addMessage(menu: MenuOptions) {
        let msgKey = ''
        let panel = menu.message.panel;
        let funcName = menu.message.name;
        let isSendToSelf = !menu.message.panel || menu.message.panel === this.config.manifest.name;
        if (isSendToSelf) {
            // 发送给自己，消息名字直接用函数的名字
            panel = menu.message.panel || this.config.manifest.name;
            msgKey = funcName;
        }

        let messages = this.packageData!.contributions!.messages!;
        let item = Object.keys(messages).find(el => el === msgKey);
        if (!item) {
            messages[msgKey] = { methods: [] }
        }
        let message = messages[msgKey];
        if (!message.methods!.find(el => el === funcName)) {
            // 发送给自己，就不用.分割了
            if (isSendToSelf) {
                message.methods!.push(`${funcName}`)
            } else {
                message.methods!.push(`${panel}.${funcName}`);
            }
        }
        return msgKey;
    }
}
