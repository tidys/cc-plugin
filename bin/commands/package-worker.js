"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageV3 = exports.PackageV2 = exports.PackageInterface = void 0;
class PackageInterface {
    constructor(config) {
        this.config = config;
    }
    menuReady() { }
    ;
    menuBuild(menu) { }
    ;
    panelReady() { }
    ;
    panelBuild(panel) { }
    ;
}
exports.PackageInterface = PackageInterface;
class PackageV2 extends PackageInterface {
    constructor(config, packageDta) {
        super(config);
        this.packageData = null;
        this.packageData = packageDta;
    }
    menuReady() {
        super.menuReady();
        this.packageData['main-menu'] = {};
    }
    menuBuild(menu) {
        super.menuBuild(menu);
        let menus = this.packageData['main-menu'];
        const { name } = menu.message;
        const panel = menu.message.panel || this.config.manifest.name;
        menus[menu.path] = { message: `${panel}:${name}` };
    }
    panelReady() {
        super.panelReady();
    }
    panelBuild(panel) {
        super.panelBuild(panel);
        const panelName = !!panel.name ? `panel.${panel.name}` : 'panel';
        if (!this.packageData.hasOwnProperty(panelName)) {
            // @ts-ignore
            packageJson[`${panelName}`] = {
                main: panel.main,
                title: panel.title,
                type: panel.type,
                width: panel.width,
                height: panel.height,
                'min-width': panel.minWidth,
                'min-height': panel.minHeight,
            };
        }
        else {
            console.log('重复的panel');
        }
    }
}
exports.PackageV2 = PackageV2;
class PackageV3 extends PackageInterface {
    constructor(config, packageData) {
        super(config);
        this.packageData = null;
        this.packageData = packageData;
        this.packageData.package_version = 2;
    }
    panelReady() {
        super.panelReady();
    }
    panelBuild(panel) {
    }
    menuReady() {
        super.panelReady();
        this.packageData.contributions = {
            messages: {},
            menu: [],
            shortcuts: [],
        };
    }
    menuBuild(menuOpts) {
        super.menuBuild(menuOpts);
        let menu = this.packageData.contributions.menu;
        let msgKey = this.addMessage(menuOpts);
        menu.push({
            path: menuOpts.path,
            label: menuOpts.path,
            message: msgKey,
        });
    }
    addMessage(menu) {
        let msgKey = '';
        let panel = menu.message.panel;
        let funcName = menu.message.name;
        let isSendToSelf = !menu.message.panel || menu.message.panel === this.config.manifest.name;
        if (isSendToSelf) {
            // 发送给自己，消息名字直接用函数的名字
            panel = menu.message.panel || this.config.manifest.name;
            msgKey = funcName;
        }
        let messages = this.packageData.contributions.messages;
        let item = Object.keys(messages).find(el => el === msgKey);
        if (!item) {
            messages[msgKey] = { methods: [] };
        }
        let message = messages[msgKey];
        if (!message.methods.find(el => el === funcName)) {
            // 发送给自己，就不用.分割了
            if (isSendToSelf) {
                message.methods.push(`${funcName}`);
            }
            else {
                message.methods.push(`${panel}.${funcName}`);
            }
        }
        return msgKey;
    }
}
exports.PackageV3 = PackageV3;
