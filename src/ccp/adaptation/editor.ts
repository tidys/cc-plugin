import { Base } from "./base";

// 为啥取这个名字，因为被Editor编辑器占用了
export class CCEditor extends Base {
    get path(): string {
        if (this.adaptation.Env.isPluginV2) {
            //@ts-ignore
            return Path.dirname(Editor.appPath);
        } else {
            //@ts-ignore
            return Path.dirname(Editor.App.path);
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
            this._version = Editor.remote.App.version;
        } else {
            // @ts-ignore
            this._version = Editor.App.version;
        }
        return this._version;
    }
}
