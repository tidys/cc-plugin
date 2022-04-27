import {BuilderOptions, CocosPluginConfig, PanelOptions, Platform, PluginType} from '../declare';
import {versionApi, Versions} from './version-api';
import * as Fs from 'fs';
import axios from 'axios';

const { V246, V247 } = Versions;
const Path = require('path'); // 为了适配浏览器
const URL = require('url')

let config: CocosPluginConfig, options: PanelOptions;
let v2 = true;
let web = true;
let adaptation: Adaptation;

class Project {
    get path(): string {
        if (v2) {
            return versionApi(
                adaptation.CCEditor.version,
                [
                    {
                        version: [V246, V247],
                        fn: () => {
                            // @ts-ignore
                            return Editor.Project.path;
                        }
                    }
                ],
                () => {
                    // @ts-ignore
                    return Editor.projectInfo.path;
                })
        } else {
            // @ts-ignore
            return Editor.Project.path;
        }
    }
}

class Util {
    fspathToUrl(fspath: string): string | null {
        if (v2) {
            // @ts-ignore
            return Editor.assetdb.remote.fspathToUrl(fspath);
        } else {
            // 暂时不想使用编辑器的接口
            // Editor.Message.request("asset-db",'query-uuid',url);
            const projectPath = adaptation.Project.path;
            const packageDir = Path.join(projectPath, 'extensions');
            const assetDir = Path.join(projectPath, 'assets');
            if (fspath.includes(packageDir)) {
                return fspath.replace(packageDir, 'packages:/')
            } else if (fspath.includes(assetDir)) {
                return fspath.replace(assetDir, 'db:/')
            } else {
                return null;
            }
        }
    }

    urlToFspath(url: string) {
        let result = URL.parse(url);
        let r1 = result.pathname
            ? Path.join(result.hostname, result.pathname)
            : Path.join(result.hostname);
        if (v2) {
            throw new Error('没有实现的接口')
        } else if (web) {
            if (result.protocol === 'packages:') {
                const pluginName = config.manifest.name;
                if (r1.startsWith('/')) {
                    r1 = r1.substring(1, r1.length)
                }
                if (r1.startsWith(pluginName)) {
                    r1 = r1.substring(pluginName.length, r1.length)
                }
            }
            return r1;
        } else {
            if (result.protocol === 'packages:') {
                return Path.join(adaptation.Project.path, 'extensions', r1)
            } else if (result.protocol === 'db:') {
                return Path.join(adaptation.Project.path, r1)
            } else if (result.protocol === 'project:') {
                return Path.join(adaptation.Project.path, r1)
            }
            return null;
        }
    }
}

const Electron = require('electron');

class Shell {
    showItem(path: string) {
        if (v2) {
            // @ts-ignore
            Electron.remote?.shell?.showItemInFolder(path);
        } else {
            // @ts-ignore
            Electron.remote?.shell?.showItemInFolder(path);
        }
    }

    beep() {
        if (v2) {
            // @ts-ignore
            Electron.remote?.shell?.beep();
        } else {
            // @ts-ignore
            Electron.remote?.shell?.beep();
        }
    }
}

class Panel {
    open(panel: string) {
        const array = panel.split('.');
        if (array.length >= 2) {
            let [panelName, panelID] = array;
            if (!config) {
                throw new Error(`未设置config`)
            }
            const { manifest, options } = config!;
            // if (options?.version === PluginVersion.v2) { }
            if (panelName === 'self') {
                panelName = manifest!.name
                // 查找panelID是否存在
                if (!manifest?.panels?.find(el => el.name === panelID)) {
                    console.error(`open failed: ${panel}`)
                    return
                }
            }
            //@ts-ignore
            Editor.Panel.open(`${panelName}.${panelID}`);
        }
    }

    close() {

    }

}

class Builder {
    public isNativePlatform(platform: string) {
        return !![Platform.Android, Platform.Ios, Platform.Mac, Platform.Win32].includes(platform);
    }

    async getConfig(): Promise<BuilderOptions[]> {
        // 为了配合3.x，统一返回array
        let ret: BuilderOptions[] = [];
        if (v2) {
            const buildCfgFile = Path.join(adaptation.Project.path, 'local/builder.json');
            if (Fs.existsSync(buildCfgFile)) {
                const buildData: { template: string, buildPath: string, platform: string } = JSON.parse(Fs.readFileSync(buildCfgFile, 'utf-8'))
                const buildPath = Path.join(adaptation.Project.path, buildData.buildPath)

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
        } else {
            // @ts-ignore
            let cfg = await Editor.Profile.getConfig('builder', 'BuildTaskManager.taskMap', 'local');
            Object.keys(cfg).forEach(key => {
                const item: any = cfg[key].options;
                if (item) {
                    const buildPath = adaptation.Util.urlToFspath(item.buildPath);
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

class Env {
    get isWin() {
        return process.platform === 'win32'
    }

    get isMac() {
        return process.platform === 'darwin';
    }
}

class Simulator {
    // 模拟器的完整路径
    get path(): string {
        if (v2) {
            return Path.join(adaptation.CCEditor.path, 'cocos2d-x/simulator/');
        } else {
            if (adaptation.Env.isWin) {
                throw new Error('没有适配')
            } else if (adaptation.Env.isMac) {
                return Path.join(adaptation.CCEditor.path, 'resources/3d/engine-native/simulator/Debug/')
            }
        }
        return '';
    }

    get remoteAssetDir() {
        const macFixPath = 'Contents/Resources/remote-asset'
        if (v2) {
            if (adaptation.Env.isWin) {
                return Path.join(this.path, 'win32/remote-asset');
            } else if (adaptation.Env.isMac) {
                return Path.join(this.path, 'mac/Simulator.app/', macFixPath);
            }
        } else {
            if (adaptation.Env.isWin) {
                throw new Error('没有适配')
            } else if (adaptation.Env.isMac) {
                return Path.join(this.path, 'SimulatorApp-Mac.app', macFixPath);
            }
        }
    }
}

// 为啥取这个名字，因为被Editor编辑器占用了
class CCEditor {
    get path(): string {
        if (v2) {
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
        if (v2) {
            // @ts-ignore
            this._version = Editor.remote.App.version;
        } else {
            // @ts-ignore
            this._version = Editor.App.version;
        }
        return this._version;
    }
}

class AssetDB {
    refresh(url: string) {
        if (v2) {
            // @ts-ignore
            Editor.assetdb.refresh(url);
        } else {
            // 暂时不需要实现，编辑器会自动刷新
        }
    }


    async fileData(url: string): Promise<string> {
        let fspath = adaptation.Util.urlToFspath(url);
        if (fspath) {
            if (web) {
                const ext = Path.extname(fspath);
                if (!ext) {
                    return ''
                } else {
                    const res = await axios.get(fspath);
                    return res.data;
                }
            }

        }
        return ''
    }
}

interface FileFilter {
    extensions: string[];
    name: string;
}

export interface SelectDialogOptions {
    title?: string;
    path?: string;
    type?: 'directory' | 'file';
    button?: string;
    multi?: boolean;
    filters?: FileFilter[];
    extensions?: string;
}

class Log {
    error(str: string) {
        if (web) {
            console.error(str);
        } else {
            // todo 待实现
        }
    }

    log(str: string) {
        if (web) {
            console.log(str);
        } else {
            // todo 待实现
        }
    }

    info(str: string) {
        if (web) {
            console.log(str);
        } else {
            // todo 待实现
        }
    }
}

class Dialog {
    async select(options: SelectDialogOptions): Promise<string[]> {
        if (v2) {
            let properties = '';
            if (options.type === 'directory') {
                properties = 'openDirectory'
            } else if (options.type === 'file') {
                properties = 'openFile';
            }
            //@ts-ignore 更多的参数后续慢慢适配
            const ret = Editor.Dialog.openFile({
                title: options.title,
                defaultPath: options.path,
                properties: [properties],
            })
            if (ret === -1) {
                return []
            }
            return ret || [];
        } else {
            // @ts-ignore
            const ret = await Editor.Dialog.select(options);
            return ret.filePaths || [];
        }
    }
}

export class Adaptation {
    public Util = new Util();
    public Env = new Env();
    public Simulator = new Simulator();
    public Project = new Project();
    public Panel = new Panel();
    public CCEditor = new CCEditor();
    public AssetDB = new AssetDB();
    public Shell = new Shell();
    public Dialog = new Dialog();
    public Builder = new Builder();
    public Log = new Log();

    public require(name: string): any {
        if (v2) {
            // @ts-ignore
            return Editor.require(`packages://${config.manifest!.name}/node_modules/${name}`)
        } else {
            const url = `packages://${config.manifest!.name}/node_modules/${name}`;
            const fsPath = adaptation.Util.urlToFspath(url);
            if (fsPath) {
                return eval('require(`${fsPath}`)')
                // return require(fsPath)
            }
            return null;
        }
    }

    public url(url: string) {
        if (v2) {
            // @ts-ignore
            return Editor.url(url)
        } else {
            return adaptation.Util.urlToFspath(url);
        }
    }

    public log(str: string) {
        if (v2) {
            // @ts-ignore
            Editor.log(str)
        } else {
            console.log(str);
        }
    }

    init(pluginConfig: CocosPluginConfig, type: PluginType) {
        config = pluginConfig;
        v2 = type === PluginType.PluginV2;
        web = type === PluginType.Web;
    }
}

adaptation = new Adaptation();

export default adaptation;
