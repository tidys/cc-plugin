import { existsSync } from 'fs';
import FsExtra from 'fs-extra';
import { dirname, join } from 'path';
import { CocosPluginService } from 'service';
import webpack from 'webpack';
import { log } from '../log';
import { ChromeConst } from './const';

interface IAction {
    default_popup: string,
    default_icon: {
        "48": string,
    },
    default_title: string,
}

class ChromeManifestDataBase {
    public manifest_version: number = 0;
    public version: string;

    public name: string;
    public description: string = '';
    public icons = { "48": "" }
    public devtools_page: string = "";
    public content_scripts: Array<{
        matches: string[],
        js: string[],
        run_at: string | "document_start" | "document_end",
        all_frames: boolean,
    }> = [];
    public options_ui: { page: string, browser_style: boolean, } = {
        page: "",
        browser_style: true,
    };

    constructor(name: string, version: string, description: string = "") {
        this.name = name;
        this.version = version;
        this.description = description;
    }
    addContentScript(script: string) {
        this.content_scripts.push({
            matches: ["<all_urls>"],
            js: [script],
            run_at: "document_end",
            all_frames: true,
        });
        return this;
    }
    setOptionsPage(page: string) {
        this.options_ui.page = page;
        return this;
    }
    setDevtoolsPage(page: string) {
        this.devtools_page = page;
        return this;
    }
}
const permissions = [
    "storage",
];
const host_permissions = [
    "wss://*/*",
    "ws://*/*",
    "<all_urls>",
    "*://*/*",
    "http://*/*",
    "https://*/*",
];
/**
 * 清单文件的资源
 */
interface ResourcesV3 {
    resources: string[];
    matches: string[];
    /**
     * 如果为 true，则仅允许通过动态 ID 访问资源。系统会为每个会话生成一个动态 ID。
     * 
     * 系统会在浏览器重启或扩展程序重新加载时重新生成此文件。
     */
    use_dynamic_url?: boolean;
}
class ChromeManifestDataV3 extends ChromeManifestDataBase {
    private permissions: string[] = permissions;
    private web_accessible_resources: ResourcesV3[] = [{
        resources: ["*.js"],
        matches: ["<all_urls>", "*://*/*"],
        use_dynamic_url: false,
    }];
    private host_permissions: string[] = host_permissions;
    private action: IAction = {
        default_popup: "",
        default_icon: {
            "48": "",
        },
        default_title: "",
    };
    private background: { service_worker: string, type: "module" | string } = {
        "service_worker": "",
        "type": "module"
    };
    constructor(name: string, version: string, description: string = "") {
        super(name, version, description);
        this.manifest_version = 3;
    }
    addBackgroundScript(script: string) {
        this.background.service_worker = script;
        this.background.type = "module";
        return this;
    }

    setPopupPage(page: string, title: string) {
        this.action.default_popup = page;
        this.action.default_title = title;
        return this;
    }
    setIcon(icon: string) {
        this.icons["48"] = icon;
        this.action.default_icon["48"] = icon;
        return this;
    }
}

class ChromeManifestDataV2 extends ChromeManifestDataBase {
    private browser_action: IAction = {
        default_popup: "",
        default_icon: {
            "48": "",
        },
        default_title: "",
    };
    private permissions: string[] = permissions;
    private background: { scripts: string[], persistent: boolean, } = { scripts: [], persistent: false };
    private web_accessible_resources: string[] = ["*/*", "*"];
    private content_security_policy: string = "script-src 'self' ;  object-src 'self'";
    constructor(name: string, version: string, description: string = "") {
        super(name, version, description);
        this.manifest_version = 2;
    }
    addBackgroundScript(script: string) {
        this.background.scripts.push(script);
        return this;
    }
    setPopupPage(page: string, title: string) {
        this.browser_action.default_popup = page;
        this.browser_action.default_title = title;
        return this;
    }
    setIcon(icon: string) {
        this.icons["48"] = icon;
        this.browser_action.default_icon["48"] = icon;
        return this;
    }
}

export class ChromeManifest {
    private service;
    constructor(service: CocosPluginService) {
        this.service = service;
    }
    private bProduction: boolean = false;
    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tap('ChromeManifest', (compilation: webpack.Compilation) => {
            this.bProduction = compilation.compiler.options.mode === "production";
            this.buildManifestFile();
        })
    }
    private dealIcon() {
        let icon_res = '';
        const { type, manifest } = this.service.projectConfig;
        const { icon } = manifest;
        if (icon) {
            if (typeof icon === 'string') {
                icon_res = icon;
            } else {
                const icon48 = icon[48];
                if (icon48) {
                    icon_res = icon48;
                }
            }
        }
        if (icon_res) {
            const distDir = this.service.projectConfig.options.output!;
            const icon_src_path = join(this.service.context, icon_res);
            if (!existsSync(icon_src_path)) {
                icon_res = "";
                log.red(`icon file not found: ${icon_src_path}`);
                process.exit(0);
            } else {
                const dest = join(distDir, icon_res);
                FsExtra.ensureFileSync(dest)
                FsExtra.copyFileSync(icon_src_path, dest);
            }
        }
        return icon_res;
    }
    buildManifestFile() {
        const { type, manifest } = this.service.projectConfig;
        const ctor = manifest.chrome?.version === 3 ? ChromeManifestDataV3 : ChromeManifestDataV2;
        const data = new ctor(manifest.name, manifest.version, manifest.description);
        // 处理icon
        const icon = this.dealIcon();
        if (icon) {
            data.setIcon(icon);
        }

        data.addBackgroundScript(ChromeConst.script.background);
        data.addContentScript(ChromeConst.script.content);
        data.setOptionsPage(ChromeConst.html.options);
        data.setPopupPage(ChromeConst.html.popup, manifest.name);
        data.setDevtoolsPage(ChromeConst.html.devtools);
        this.saveManifestFile(data);
    }
    private saveManifestFile(data: ChromeManifestDataV2 | ChromeManifestDataV3) {
        const options = this.service.projectConfig.options!;
        const packageJsonFile = join(options.output! as string, 'manifest.json');
        let spaces = options.min ? 0 : 4;
        if (this.bProduction) {
            spaces = 0;
        }
        FsExtra.writeJSONSync(packageJsonFile, data, { spaces });
    }
}