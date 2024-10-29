import { Base } from "./base";
import { BuilderOptions, CocosPluginConfig, PanelOptions, Platform, PluginType } from '../../declare';
export class Env extends Base {
    private _type: PluginType | null = null;

    init() {
        console.log(__PLUGIN_TYPE__);
        this._type = __PLUGIN_TYPE__ as PluginType;
    }
    /**
     * 是否为开发环境
     */
    get isDev() {
        return !!__DEV__;
    }
    get isWeb() {
        return this._type === PluginType.Web;
    }
    get isChrome() {
        return this._type === PluginType.Chrome;
    }
    get isElectron() {
        return this._type === PluginType.Electron;
    }
    get isPluginV2() {
        return this._type === PluginType.PluginV2;
    }
    get pluginDirectory() {
        if (this.isPluginV2) {
            return 'packages';
        }
        if (this.isPluginV3) {
            return 'extensions';
        }
        return "";
    }
    get isPluginV3() {
        return this._type === PluginType.PluginV3;
    }
    get isPlugin() {
        return this.isPluginV2 || this.isPluginV3;
    }
    get isWin() {
        return process.platform === 'win32'
    }

    get isMac() {
        return process.platform === 'darwin';
    }
}