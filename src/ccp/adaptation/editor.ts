import { Base } from "./base";
import * as Path from "path";
// 为啥取这个名字，因为被Editor编辑器占用了
export class CCEditor extends Base {
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
}
