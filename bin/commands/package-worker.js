"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageV3 = exports.PackageV2 = exports.PackageInterface = void 0;
const log_1 = require("../log");
const lodash_1 = require("lodash");
const utils_1 = __importDefault(require("../utils"));
const common_1 = require("../common");
class PackageInterface {
    constructor(config) {
        this.config = config;
        utils_1.default.init(config);
    }
    menuReady() { }
    ;
    menuBuild(menu) { }
    ;
    assetDbBuild() { }
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
    menuBuild(menu) {
        super.menuBuild(menu);
        let menus = this.packageData['main-menu'];
        const { name } = menu.message;
        const panel = menu.message.panel || this.config.manifest.name;
        const menuReal = utils_1.default.menuPackage(menu.path);
        menus[(0, lodash_1.trim)(menuReal, '/')] = { message: `${panel}:${name}` };
    }
    panelReady() {
        super.panelReady();
    }
    assetDbBuild() {
        super.assetDbBuild();
        const dbConfig = this.config.manifest.asset_db_v2;
        if (!dbConfig) {
            return;
        }
        if (!this.packageData) {
            return;
        }
        // readonly 在2.x中没用
        let readonly = true;
        if (dbConfig.readonly === undefined) {
            readonly = true;
        }
        else if (dbConfig.readonly === true) {
            readonly = true;
        }
        else {
            readonly = false;
        }
        this.packageData['runtime-resource'] = {
            path: dbConfig.path,
            // mount 的文件夹名称为 [packageName]-[runtime-resource.name]
            // name: this.config.manifest.name,
            name: "code",
        };
        this.packageData.reload = {
            ignore: [dbConfig.path]
        };
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
        var _a;
        super(config);
        this.packageData = null;
        this.packageData = packageData;
        this.packageData.package_version = 2;
        this.packageData.contributions = {
            // TODO: 目前这里是写死的，需要后续优化下
            builder: './builder.js',
            messages: {},
            menu: [],
            shortcuts: [],
            "asset-db": {},
            assets: {}
        };
        const asset_menu = this.dealAssetsMenu();
        if (asset_menu) {
            this.packageData.contributions.assets.menu = asset_menu;
        }
        if (config.manifest.scene) {
            this.packageData.contributions['scene'] = {
                script: "scene.js", // 暂时场景脚本文件名写死
            };
        }
        (_a = config.manifest.messages) === null || _a === void 0 ? void 0 : _a.map((msg) => {
            this.addMessageToContributions(msg, msg);
        });
        this.addMessageToContributions('onBuilder', 'onBuilder'); // 预定义的事件
    }
    dealAssetsMenu() {
        const asssets = this.config.manifest.assets;
        if (asssets) {
            // 配置直接写死，不让用户配置
            return {
                methods: "./assets.js", // 写死的逻辑，和webpackEntry是对应的
                createMenu: "createMenu",
                assetMenu: "assetMenu",
                dbMenu: "dbMenu",
                panelMenu: "panelMenu"
            };
        }
        return null;
    }
    assetDbBuild() {
        super.assetDbBuild();
        const dbConfig = this.config.manifest.asset_db_v3;
        if (!dbConfig) {
            return;
        }
        if (!this.packageData || !this.packageData.contributions) {
            return;
        }
        const db = this.packageData.contributions['asset-db'];
        let readonly = true;
        if (dbConfig.readonly === undefined) {
            readonly = true;
        }
        else if (dbConfig.readonly === true) {
            readonly = true;
        }
        else {
            readonly = false;
        }
        db.mount = {
            path: dbConfig.path,
            readonly: readonly
        };
    }
    panelReady() {
        super.panelReady();
        this.packageData.editor = ">=3.0.0";
        this.packageData.panels = {};
        // 预定义发送到面板的message
        (0, common_1.getValidPanels)(this.config.manifest.panels).forEach(panel => {
            /** 对应package.json的contributions.messages
             * "panelID-recv_entry": {
             *      "methods": ["panelID.recv_entry"]
             * }
             */
            const key = (0, common_1.getV3PanelRecvMessageFunctionName)(panel.name);
            const method = (0, common_1.getV3MethodFunctionName)(panel.name);
            this.addMessageToContributions(key, method);
        });
    }
    panelBuild(panel) {
        super.panelBuild(panel);
        const panels = this.packageData.panels;
        const panelName = panel.name || 'default';
        let cfg = panels[panelName] = {
            main: panel.main,
            title: panel.title,
            type: panel.type,
            size: {}
        };
        panel.icon && (cfg.icon = panel.icon);
        panel.width && (cfg.size.width = panel.width);
        panel.height && (cfg.size.height = panel.height);
        panel.minWidth && (cfg.size['min-width'] = panel.minWidth);
        panel.minHeight && (cfg.size['min-height'] = panel.minHeight);
    }
    menuReady() {
        super.panelReady();
    }
    menuBuild(menuOpts) {
        var _a;
        super.menuBuild(menuOpts);
        let menu = this.packageData.contributions.menu;
        let msgKey = this.addMessage(menuOpts);
        const menuReal = utils_1.default.menuPackage(menuOpts.path);
        let { newLabel, newPath } = this.dealPath(menuReal);
        menu.push({
            path: newPath,
            label: newLabel,
            message: msgKey,
        });
        /**
            "shortcuts": [
                {
                    "message": "undo",
                    "when": "panel.hello-world",
                    "win": "ctrl+z",
                    "mac": "cmd+z",
                }
            ]
        */
        if (menuOpts.accelerator) {
            (_a = this.packageData.contributions.shortcuts) === null || _a === void 0 ? void 0 : _a.push({
                message: msgKey,
                win: menuOpts.accelerator,
                mac: menuOpts.accelerator,
            });
        }
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
    dealPath(path) {
        let newPath = '', newLabel = '';
        path = (0, lodash_1.trim)(path, '/');
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
        newPath = (0, lodash_1.trim)(newPath, '/');
        newLabel = (0, lodash_1.trim)(newLabel, '/');
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
//# sourceMappingURL=package-worker.js.map