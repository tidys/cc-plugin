import { homedir } from "os";
import { Base } from "./base";
import * as Path from "path";
import { existsSync, readFileSync } from "fs";
// 为啥取这个名字，因为被Editor编辑器占用了
export class CCEditor extends Base {
    /**
     * 指向的是resources目录
     */
    get path(): string {
        if (this.adaptation.Env.isPluginV2) {
            //@ts-ignore
            return Path.dirname(Editor.appPath);
        } else if (this.adaptation.Env.isPluginV3) {
            //@ts-ignore
            return Path.dirname(Editor.App.path);
        } else {
            return ""
        }
    }
    get node_modules() {
        if (this.adaptation.Env.isPluginV2) {
            return ""
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            return Path.join(Editor.App.path, "node_modules")
        } else {
            return ""
        }
    }
    private _version = '';
    get version() {
        // 因为牵扯到remote，所以对这个变量做了一次缓存
        if (this._version) {
            return this._version;
        }
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            if (process.type === 'browser') {
                // @ts-ignore
                this._version = Editor.App.version;
            } else {
                // @ts-ignore
                this._version = Editor.remote.App.version;
            }
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            this._version = Editor.App.version;
        }
        return this._version;
    }
    isVersionLess(version: string) {
        const targetVersion = version.split('.');
        const currentVersion = this.version.split('.');
        const min = Math.min(targetVersion.length, currentVersion.length)
        for (let i = 0; i < min; i++) {
            const target = parseInt(targetVersion[i]);
            const current = parseInt(currentVersion[i]);
            if (current > target) {
                return false;
            }
        }
        return true;
    }
    /**
     * 获取编辑器设置的脚本编辑器
     */
    getScriptEditor(): string | null {
        const file = Path.join(homedir(), '.CocosCreator', 'profiles', 'settings.json');
        if (!existsSync(file)) {
            return null;
        }
        try {
            const data = JSON.parse(readFileSync(file, 'utf-8'));
            let ret = data['script-editor']
            if (ret) {
                return ret;
            }
            ret = data['script-editor-list'];
            if (ret && Array.isArray(ret) && ret.length) {
                return ret[0].value || null;
            }
            return null;
        } catch (e) {
            return null;
        }

    }
}
