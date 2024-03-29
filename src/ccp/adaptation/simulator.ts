
import { Base } from "./base";
const Path = require('path'); // 为了适配浏览器
export class Simulator extends Base {
    // 模拟器的完整路径
    get path(): string {
        if (this.adaptation.Env.isPluginV2) {
            return Path.join(this.adaptation.CCEditor.path, 'cocos2d-x/simulator/');
        } else if (this.adaptation.Env.isPluginV3) {
            if (this.adaptation.Env.isWin) {
                return Path.join(this.adaptation.CCEditor.path, 'resources/resources/3d/engine/native/simulator/Release')
            } else if (this.adaptation.Env.isMac) {
                return Path.join(this.adaptation.CCEditor.path, 'resources/3d/engine-native/simulator/Debug/')
            }
        } else {
            throw new Error('not support env');
        }
        return '';
    }

    get remoteAssetDir() {
        const macFixPath = 'Contents/Resources/remote-asset'
        if (this.adaptation.Env.isWeb) {
            return '';
        } else if (this.adaptation.Env.isPluginV2) {
            if (this.adaptation.Env.isWin) {
                return Path.join(this.path, 'win32/remote-asset');
            } else if (this.adaptation.Env.isMac) {
                return Path.join(this.path, 'mac/Simulator.app/', macFixPath);
            }
        } else if (this.adaptation.Env.isPluginV3) {
            if (this.adaptation.Env.isWin) {
                return Path.join(this.path, 'remote-asset')
            } else if (this.adaptation.Env.isMac) {
                return Path.join(this.path, 'SimulatorApp-Mac.app', macFixPath);
            }
        }
    }
}