import { CocosPluginConfig, CocosPluginV2, CocosPluginV3, MenuOptions, PanelOptions } from '../declare';
import { log } from '../log';
import { trim } from 'lodash'
import utils from "../utils"
import { ProjectConfig } from 'service';
export abstract class PackageInterface {
    protected config: CocosPluginConfig;

    constructor(config: ProjectConfig) {
        this.config = config;
        utils.init(config);
    }

    menuReady() {};

    menuBuild(menu: MenuOptions) {};

    panelReady() {};

    panelBuild(panel: PanelOptions) {};
}

export class PackageV2 extends PackageInterface {
    private packageData: CocosPluginV2 | null = null;

    constructor(config: ProjectConfig, packageDta: CocosPluginV2) {
        super(config);
        this.packageData = packageDta;
    }

    menuReady() {
        super.menuReady();
        this.packageData!['main-menu'] = {};
    }

  /**
   * 2.x的menu
   "main-menu": {
      "小王子/BitMap字体工具/字体图集(IMAGE)": {
          "message": "bitmap-font:openFNT"
      },
      "小王子/BitMap字体工具/字体文件(TTF)": {
          "message": "bitmap-font:openTTF"
      }
    },
   */
    menuBuild(menu: MenuOptions) {
        super.menuBuild(menu);
        let menus = this.packageData!['main-menu']!;
        const { name } = menu.message;
        const panel = menu.message.panel || this.config.manifest.name;
        const menuReal = utils.menuPackage(menu.path);
      menus[trim(menuReal, '/')] = { message: `${panel}:${name}` };
    }

    panelReady() {
        super.panelReady();
    }

    panelBuild(panel: PanelOptions) {
        super.panelBuild(panel);
        const panelName = !!panel.name ? `panel.${panel.name}` : 'panel';
        if (!this.packageData!.hasOwnProperty(panelName)) {
            // @ts-ignore
            let cfg: any = this.packageData[`${panelName}`] = {
                main: panel.main,
                title: panel.title,
                type: panel.type,
            }
            panel.icon && (cfg.icon = panel.icon);
            panel.width && (cfg.width = panel.width);
            panel.height && (cfg.height = panel.height);
            panel.minWidth && (cfg['min-width'] = panel.minWidth);
            panel.minHeight && (cfg['min-height'] = panel.minHeight);

        } else {
            console.log('重复的panel')
        }
    }
}

export class PackageV3 extends PackageInterface {
    private packageData: CocosPluginV3 | null = null;

    constructor(config: ProjectConfig, packageData: CocosPluginV3) {
        super(config);
        this.packageData = packageData; 
        this.packageData.package_version = 2;
        this.packageData!.contributions = {
            builder: './builder.js', // todo 目前这里是写死的，需要后续优化下
            messages: {},
            menu: [],
            shortcuts: [],
        };
        this.addMessageToContributions('onBuilder', 'onBuilder');
    }


    panelReady() {
        super.panelReady();
        this.packageData!.panels = {}
    }

    panelBuild(panel: PanelOptions) {
        super.panelBuild(panel);
        const panels = this.packageData!.panels!;
        const panelName = panel.name || 'default';
        let cfg: any = panels[panelName] = {
            main: panel.main,
            title: panel.title,
            type: panel.type,
        }
        panel.icon && (cfg.icon = panel.icon);
        panel.width && (cfg.width = panel.width);
        panel.height && (cfg.height = panel.height);
        panel.minWidth && (cfg['min-width'] = panel.minWidth);
        panel.minHeight && (cfg['min-height'] = panel.minHeight);
    }

    menuReady() {
        super.panelReady();
    }

    menuBuild(menuOpts: MenuOptions) {
        super.menuBuild(menuOpts);
        let menu = this.packageData!.contributions!.menu!;
        let msgKey = this.addMessage(menuOpts);
        const menuReal = utils.menuPackage(menuOpts.path);
      let { newLabel, newPath } = this.dealPath(menuReal);
        menu.push({
            path: newPath,
            label: newLabel,
            message: msgKey,
        })
    }

  /**
   * 3.x的menu格式
   menu:[
      {
          "path": "小王子/BitMap字体工具",
          "label": "字体图集(IMAGE)",
          "message": "openFNT"
      }
  ]
   */
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

    private addMessageToContributions(msgKey: string, methodName: string) {
        let messages = this.packageData!.contributions!.messages!;
        let item = Object.keys(messages).find(el => el === msgKey);
        if (!item) {
            messages[msgKey] = { methods: [] }
        }
        let message = messages[msgKey];
        if (!message.methods!.find(el => el === methodName)) {
            message.methods!.push(methodName);
        }
    }

    private addMessage(menu: MenuOptions) {
        const pkgName = this.config.manifest.name;
        const panel = menu.message.panel || pkgName; // panel参数不填写，默认为自己
        const funcName = menu.message.name;
        let msgKey = '', methodName = '';
        if (panel === pkgName) {
            // 发送给自己，消息名字直接用函数的名字
            msgKey = methodName = funcName;
        } else {
            msgKey = methodName = `${panel}.${funcName}`;
            log.yellow(`未验证的逻辑`)
        }
        this.addMessageToContributions(msgKey, methodName);
        return msgKey;
    }
}
