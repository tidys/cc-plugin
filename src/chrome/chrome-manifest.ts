import { dirname, join } from 'path';
import { CocosPluginService } from 'service';
import webpack from 'webpack';
import FsExtra from 'fs-extra';
import { ChromeConst } from './const';
import { existsSync } from 'fs';
import { log } from '../log';

class ChromeManifestData {
    public manifest_version: number = 2;
    public version: string;
    public name: string;
    public description: string = '';
    public permissions: string[] = [
        "activeTab", "<all_urls>", "*://*/*", "tabs", "http://*/*", "https://*/*", "audio", "system.cpu", "clipboardRead",
        "clipboardWrite", "system.memory", "processes", "tabs", "storage", "nativeMessaging", "contextMenus", "notifications"
    ];
    private icons = { "48": "" }
    private devtools_page: string = "";
    private background: {
        scripts: string[],
        persistent: boolean,
    } = {
            scripts: [],
            persistent: false,
        };
    private content_scripts: Array<{
        matches: string[],
        js: string[],
        run_at: string | "document_start" | "document_end",
        all_frames: boolean,
    }> = [];
    private options_ui: {
        page: string,
        browser_style: boolean,
    } = {
            page: "",
            browser_style: true,
        };
    private browser_action: {
        default_popup: string,
        default_icon: {
            "48": string,
        },
        default_title: string,
    } = {
            default_popup: "",
            default_icon: {
                "48": "",
            },
            default_title: "",
        };
    public web_accessible_resources: string[] = ["*/*", "*"];
    public content_security_policy: string = "script-src 'self' ;  object-src 'self'";
    constructor(name: string, version: string, description: string = "") {
        this.name = name;
        this.version = version;
        this.description = description;
    }
    addBackgroundScript(script: string) {
        this.background.scripts.push(script);
        return this;
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
    setDevtoolsPage(page: string) {
        this.devtools_page = page;
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
        const data = new ChromeManifestData(manifest.name, manifest.version, manifest.description);
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
    private saveManifestFile(data: ChromeManifestData) {
        const options = this.service.projectConfig.options!;
        const packageJsonFile = join(options.output! as string, 'manifest.json');
        let spaces = options.min ? 0 : 4;
        if (this.bProduction) {
            spaces = 0;
        }
        FsExtra.writeJSONSync(packageJsonFile, data, { spaces });
    }
}