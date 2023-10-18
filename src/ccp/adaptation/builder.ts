import { Base } from "./base";
import { BuilderOptions, CocosPluginConfig, PanelOptions, Platform, PluginType } from '../../declare';
const Path = require('path'); // 为了适配浏览器
import * as Fs from 'fs';

export class Builder extends Base {
    public isNativePlatform(platform: string) {
        return !![Platform.Android, Platform.Ios, Platform.Mac, Platform.Win32].includes(platform);
    }

    async getConfig(): Promise<BuilderOptions[]> {
        // 为了配合3.x，统一返回array
        let ret: BuilderOptions[] = [];
        if (this.adaptation.Env.isPluginV2) {
            const buildCfgFile = Path.join(this.adaptation.Project.path, 'local/builder.json');
            if (Fs.existsSync(buildCfgFile)) {
                const buildData: { template: string, buildPath: string, platform: string } = JSON.parse(Fs.readFileSync(buildCfgFile, 'utf-8'))
                const buildPath = Path.join(this.adaptation.Project.path, buildData.buildPath)

                if (this.isNativePlatform(buildData.platform)) {
                    // native平台使用的是jsb-xxx目录
                    let outputPath = Path.join(buildPath, `jsb-${buildData.template}`)
                    ret.push({
                        buildPath: buildPath, outputPath,
                        platform: buildData.platform,
                        md5Cache: false,// todo 后续完善
                    })
                } else {
                    let outputPath = Path.join(buildPath, buildData.platform);
                    ret.push({
                        buildPath: buildPath, outputPath,
                        platform: buildData.platform,
                        md5Cache: false,// todo 后续完善这个字段的获取逻辑
                    });
                }
            }
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            let cfg = await Editor.Profile.getConfig('builder', 'BuildTaskManager.taskMap', 'local');
            Object.keys(cfg).forEach(key => {
                const item: any = cfg[key].options;
                if (item) {
                    const buildPath = this.adaptation.Util.urlToFspath(item.buildPath);
                    const outputPath = buildPath ? Path.join(buildPath, item.outputName) : item.buildPath;
                    ret.push({
                        buildPath: buildPath,
                        outputPath: outputPath,
                        platform: item.platform,
                        md5Cache: item.md5Cache,
                    })
                }
            })
        }
        return ret;
    }
}