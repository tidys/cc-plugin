"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageV3 = exports.PackageV2 = exports.PackageInterface = void 0;
const log_1 = require("../log");
const lodash_1 = require("lodash");
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
        menus[lodash_1.trim(menu.path, '/')] = { message: `${panel}:${name}` };
    }
    panelReady() {
        super.panelReady();
    }
    panelBuild(panel) {
        super.panelBuild(panel);
        const panelName = !!panel.name ? `panel.${panel.name}` : 'panel';
        if (!this.packageData.hasOwnProperty(panelName)) {
            // @ts-ignore
            let cfg = this.packageData[`${panelName}`] = {
                main: panel.main,
                title: panel.title,
                type: panel.type,
            };
            panel.icon && (cfg.icon = panel.icon);
            panel.width && (cfg.width = panel.width);
            panel.height && (cfg.height = panel.height);
            panel.minWidth && (cfg['min-width'] = panel.minWidth);
            panel.minHeight && (cfg['min-height'] = panel.minHeight);
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
        this.packageData.contributions = {
            builder: './builder.js',
            messages: {},
            menu: [],
            shortcuts: [],
        };
        this.addMessageToContributions('onBuilder', 'onBuilder');
    }
    panelReady() {
        super.panelReady();
        this.packageData.panels = {};
    }
    panelBuild(panel) {
        super.panelBuild(panel);
        const panels = this.packageData.panels;
        const panelName = panel.name || 'default';
        let cfg = panels[panelName] = {
            main: panel.main,
            title: panel.title,
            type: panel.type,
        };
        panel.icon && (cfg.icon = panel.icon);
        panel.width && (cfg.width = panel.width);
        panel.height && (cfg.height = panel.height);
        panel.minWidth && (cfg['min-width'] = panel.minWidth);
        panel.minHeight && (cfg['min-height'] = panel.minHeight);
    }
    menuReady() {
        super.panelReady();
    }
    menuBuild(menuOpts) {
        super.menuBuild(menuOpts);
        let menu = this.packageData.contributions.menu;
        let msgKey = this.addMessage(menuOpts);
        let { newLabel, newPath } = this.dealPath(menuOpts.path);
        menu.push({
            path: newPath,
            label: newLabel,
            message: msgKey,
        });
    }
    dealPath(path) {
        let newPath = '', newLabel = '';
        path = lodash_1.trim(path, '/');
        const items = path.split('/');
        if (items.length >= 2) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (i === items.length - 1) {
                    newLabel = item;
                }
                else {
                    newPath += item + '/';
                }
            }
        }
        else {
            const item = items[0];
            if (item) {
                newPath = newLabel = item;
            }
            log_1.log.yellow(`没有以/分割菜单，默认配置为`);
        }
        newPath = lodash_1.trim(newPath, '/');
        newLabel = lodash_1.trim(newLabel, '/');
        return { newLabel, newPath };
    }
    addMessageToContributions(msgKey, methodName) {
        let messages = this.packageData.contributions.messages;
        let item = Object.keys(messages).find(el => el === msgKey);
        if (!item) {
            messages[msgKey] = { methods: [] };
        }
        let message = messages[msgKey];
        if (!message.methods.find(el => el === methodName)) {
            message.methods.push(methodName);
        }
    }
    addMessage(menu) {
        const pkgName = this.config.manifest.name;
        const panel = menu.message.panel || pkgName; // panel参数不填写，默认为自己
        const funcName = menu.message.name;
        let msgKey = '', methodName = '';
        if (panel === pkgName) {
            // 发送给自己，消息名字直接用函数的名字
            msgKey = methodName = funcName;
        }
        else {
            msgKey = methodName = `${panel}.${funcName}`;
            log_1.log.yellow(`未验证的逻辑`);
        }
        this.addMessageToContributions(msgKey, methodName);
        return msgKey;
    }
}
exports.PackageV3 = PackageV3;
