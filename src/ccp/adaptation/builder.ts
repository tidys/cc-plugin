import { Base } from "./base";
import { BuilderOptions, CocosPluginConfig, PanelOptions, Platform, PluginType } from '../../declare';
const Path = require('path'); // 为了适配浏览器
import * as Fs from 'fs';
import { Local_Builder_Json, Settings_Builder_Json, getV2LocalBuilderJson, getV2SettingsBuildData } from "../types/plugin-v2";
import { Task, getAndroidTaskMap, getNativeItem, getV3AndroidJson, getV3BuilderJson, getV3NativeJson } from "../types/plugin-v3";
import * as dayjs from 'dayjs'
import { Dayjs } from 'dayjs'
import { join } from "path";
export class Builder extends Base {
    getEncryptInfo(): { key: string, encrypt: boolean, zip: boolean } {
        const ret = { key: "", encrypt: false, zip: false }
        if (this.adaptation.Env.isPluginV2) {
            const data = getV2SettingsBuildData(this.adaptation.Project.path);
            if (data) {
                ret.encrypt = data.encryptJs;
                ret.key = data.xxteaKey;
                ret.zip = data.zipCompressJs;
            }
        }
        return ret;
    }
    public getAndroidInfo(): null | { package: string, orientation: string, name: string } {
        const ret = {
            package: "",
            orientation: "",
            name: "",
        }
        function updateOrientation(landscapeLeft: boolean, landscapeRight: boolean, portrait: boolean, upsideDown: boolean) {
            if (landscapeLeft && landscapeRight && portrait && upsideDown) {
                ret.orientation = "fullSensor"
            } else if (!landscapeLeft && !landscapeRight && !portrait && !upsideDown) {
                ret.orientation = "unspecified"
            } else if (landscapeLeft && landscapeRight) {
                ret.orientation = "sensorLandscape"
            } else if (landscapeLeft) {
                ret.orientation = "reverseLandscape"
            } else if (landscapeRight) {
                ret.orientation = "landscape"
            } else if (upsideDown) {
                ret.orientation = "sensorPortrait"
            } else if (portrait) {
                ret.orientation = "portrait"
            } else {
                ret.orientation = "unspecified"
            }
        }
        if (this.adaptation.Env.isPluginV2) {
            const data = getV2SettingsBuildData(this.adaptation.Project.path);
            if (data && data.android) {
                ret.package = data.android.packageName || "";
                ret.name = data.title || "";
                const { landscapeLeft, landscapeRight, portrait, upsideDown } = data.orientation
                updateOrientation(landscapeLeft, landscapeRight, portrait, upsideDown)
            }
        } else if (this.adaptation.Env.isPluginV3) {
            const task: Task | null = this.getLatestBuildTask();
            if (!task) {
                return null;
            }
            const androidOptions = getAndroidTaskMap(this.adaptation.Project.path, task.id);
            if (!androidOptions) {
                return null;
            }
            const taskMap = getNativeItem(this.adaptation.Project.path, task.id);
            if (!taskMap) {
                return null;
            }
            ret.package = androidOptions.packageName || "";
            ret.name = task.options.name || "";
            const { landscapeLeft, landscapeRight, portrait, upsideDown } = androidOptions.orientation;
            updateOrientation(landscapeLeft, landscapeRight, portrait, upsideDown)
        }
        return ret;
    }

    /**
     * native 平台在v2版本，只会索引到build/jsb-link/，也就是assets所在的目录
     */
    getLatestBuildDirectory(): string {
        if (this.adaptation.Env.isPluginV2) {
            const data: Local_Builder_Json | null = getV2LocalBuilderJson(this.adaptation.Project.path);
            if (!data) {
                return ""
            }
            if (!data.buildPath) {
                return ""
            }
            data.buildPath = Path.join(this.adaptation.Project.path, data.buildPath);
            if (!Fs.existsSync(data.buildPath)) {
                return ""
            }
            if (!data.actualPlatform) {
                return ""
            }
            let dir = null;
            if ([Platform.Android, Platform.Ios, Platform.Win32].includes(data.actualPlatform as Platform)) {
                dir = Path.join(data.buildPath, `jsb-${data.template}`)
            } else {
                dir = Path.join(data.buildPath, data.actualPlatform);
            }
            if (!dir || !Fs.existsSync(dir)) {
                return ""
            }
            return dir;
        } else if (this.adaptation.Env.isPluginV3) {
            const task: Task | null = this.getLatestBuildTask();
            if (task && task.options) {
                const { buildPath, outputName } = task.options;
                const buildRoot = this.adaptation.Util.urlToFspath(buildPath);
                const dir = join(buildRoot, outputName);
                if (Fs.existsSync(dir)) {
                    return dir;
                }
            }
        }
        return ""
    }
    getLatestBuildPlatform(): Platform {
        if (this.adaptation.Env.isPluginV2) {
            const data: Local_Builder_Json | null = getV2LocalBuilderJson(this.adaptation.Project.path);
            if (!data) {
                return Platform.Unknown
            }
            return (data.platform as Platform) || Platform.Unknown;
        } else if (this.adaptation.Env.isPluginV3) {
            const task: Task | null = this.getLatestBuildTask();
            if (task) {
                return task.options?.platform as Platform || Platform.Unknown;
            }
        }
        return Platform.Unknown;
    }

    private getLatestBuildTask(): Task | null {
        const data = getV3BuilderJson(this.adaptation.Project.path)
        if (data) {
            const { taskMap } = data.BuildTaskManager;
            if (taskMap) {
                const taskArray: Task[] = [];
                for (const key in taskMap) {
                    const task = taskMap[key];
                    if (task.dirty) {
                        continue;
                    }
                    if (task.options?.platform === Platform.Android) {
                        taskArray.push(task);
                    }
                }
                if (taskArray.length) {
                    taskArray.sort((a: Task, b: Task) => {
                        const timeA = dayjs(a.time).valueOf();
                        const timeB = dayjs(b.time).valueOf();
                        return timeB - timeA;
                    })
                    return taskArray[0];
                }
            }
        }
        return null;
    }
    public isNativePlatform(platform: Platform) {
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

                if (this.isNativePlatform(buildData.platform as Platform)) {
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