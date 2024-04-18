"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromeManifest = void 0;
const path_1 = require("path");
const fs_extra_1 = __importDefault(require("fs-extra"));
const const_1 = require("./const");
const fs_1 = require("fs");
const log_1 = require("../log");
class ChromeManifestDataBase {
    constructor(name, version, description = "") {
        this.manifest_version = 0;
        this.description = '';
        this.icons = { "48": "" };
        this.devtools_page = "";
        this.content_scripts = [];
        this.options_ui = {
            page: "",
            browser_style: true,
        };
        this.name = name;
        this.version = version;
        this.description = description;
    }
    addContentScript(script) {
        this.content_scripts.push({
            matches: ["<all_urls>"],
            js: [script],
            run_at: "document_end",
            all_frames: true,
        });
        return this;
    }
    setOptionsPage(page) {
        this.options_ui.page = page;
        return this;
    }
    setDevtoolsPage(page) {
        this.devtools_page = page;
        return this;
    }
}
const permissions = [
    "wss://*/*",
    "ws://*/*",
    "activeTab", "<all_urls>", "*://*/*", "tabs", "http://*/*", "https://*/*", "audio", "system.cpu", "clipboardRead",
    "clipboardWrite", "system.memory", "processes", "tabs", "storage", "nativeMessaging", "contextMenus", "notifications"
];
class ChromeManifestDataV3 extends ChromeManifestDataBase {
    constructor(name, version, description = "") {
        super(name, version, description);
        this.host_permissions = permissions;
        this.action = {
            default_popup: "",
            default_icon: {
                "48": "",
            },
            default_title: "",
        };
        this.background = {
            "service_worker": "",
            "type": "module"
        };
        this.manifest_version = 3;
    }
    addBackgroundScript(script) {
        this.background.service_worker = script;
        this.background.type = "module";
        return this;
    }
    setPopupPage(page, title) {
        this.action.default_popup = page;
        this.action.default_title = title;
        return this;
    }
    setIcon(icon) {
        this.icons["48"] = icon;
        this.action.default_icon["48"] = icon;
        return this;
    }
}
class ChromeManifestDataV2 extends ChromeManifestDataBase {
    constructor(name, version, description = "") {
        super(name, version, description);
        this.browser_action = {
            default_popup: "",
            default_icon: {
                "48": "",
            },
            default_title: "",
        };
        this.permissions = permissions;
        this.background = { scripts: [], persistent: false };
        this.web_accessible_resources = ["*/*", "*"];
        this.content_security_policy = "script-src 'self' ;  object-src 'self'";
        this.manifest_version = 2;
    }
    addBackgroundScript(script) {
        this.background.scripts.push(script);
        return this;
    }
    setPopupPage(page, title) {
        this.browser_action.default_popup = page;
        this.browser_action.default_title = title;
        return this;
    }
    setIcon(icon) {
        this.icons["48"] = icon;
        this.browser_action.default_icon["48"] = icon;
        return this;
    }
}
class ChromeManifest {
    constructor(service) {
        this.bProduction = false;
        this.service = service;
    }
    apply(compiler) {
        compiler.hooks.afterEmit.tap('ChromeManifest', (compilation) => {
            this.bProduction = compilation.compiler.options.mode === "production";
            this.buildManifestFile();
        });
    }
    dealIcon() {
        let icon_res = '';
        const { type, manifest } = this.service.projectConfig;
        const { icon } = manifest;
        if (icon) {
            if (typeof icon === 'string') {
                icon_res = icon;
            }
            else {
                const icon48 = icon[48];
                if (icon48) {
                    icon_res = icon48;
                }
            }
        }
        if (icon_res) {
            const distDir = this.service.projectConfig.options.output;
            const icon_src_path = (0, path_1.join)(this.service.context, icon_res);
            if (!(0, fs_1.existsSync)(icon_src_path)) {
                icon_res = "";
                log_1.log.red(`icon file not found: ${icon_src_path}`);
                process.exit(0);
            }
            else {
                const dest = (0, path_1.join)(distDir, icon_res);
                fs_extra_1.default.ensureFileSync(dest);
                fs_extra_1.default.copyFileSync(icon_src_path, dest);
            }
        }
        return icon_res;
    }
    buildManifestFile() {
        var _a;
        const { type, manifest } = this.service.projectConfig;
        const ctor = ((_a = manifest.chrome) === null || _a === void 0 ? void 0 : _a.version) === 3 ? ChromeManifestDataV3 : ChromeManifestDataV2;
        const data = new ctor(manifest.name, manifest.version, manifest.description);
        // 处理icon
        const icon = this.dealIcon();
        if (icon) {
            data.setIcon(icon);
        }
        data.addBackgroundScript(const_1.ChromeConst.script.background);
        data.addContentScript(const_1.ChromeConst.script.content);
        data.setOptionsPage(const_1.ChromeConst.html.options);
        data.setPopupPage(const_1.ChromeConst.html.popup, manifest.name);
        data.setDevtoolsPage(const_1.ChromeConst.html.devtools);
        this.saveManifestFile(data);
    }
    saveManifestFile(data) {
        const options = this.service.projectConfig.options;
        const packageJsonFile = (0, path_1.join)(options.output, 'manifest.json');
        let spaces = options.min ? 0 : 4;
        if (this.bProduction) {
            spaces = 0;
        }
        fs_extra_1.default.writeJSONSync(packageJsonFile, data, { spaces });
    }
}
exports.ChromeManifest = ChromeManifest;
//# sourceMappingURL=chrome-manifest.js.map