import { Base } from "./base";
import { BuilderOptions, CocosPluginConfig, PanelOptions, Platform, PluginType } from '../../declare';
export class Env extends Base {
    private _type: PluginType | null = null;

    init() {
        console.log(__PLUGIN_TYPE__);
        this._type = __PLUGIN_TYPE__ as PluginType;
    }

    get isWeb() {
        return this._type === PluginType.Web;
    }

    get isPluginV2() {
        return this._type === PluginType.PluginV2;
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