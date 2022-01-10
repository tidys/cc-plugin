import { CocosPluginConfig, PanelOptions, PluginVersion } from '../declare';

const Path = require('path')
const URL = require('url')

let config: CocosPluginConfig, options: PanelOptions;
let v2 = true;
let adaptation: Adaptation;

class Project {
    get path(): string {
        if (v2) {
            // @ts-ignore
            return Editor.projectInfo.path;
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
        if (v2) {
            throw new Error('没有实现的接口')
        } else {
            const result = URL.parse(url)
            let r1 = result.pathname
                ? Path.join(result.hostname, result.pathname)
                : Path.join(result.hostname);
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

// 目前先加一些自己关心的，后续慢慢添加完善
interface BuilderOptions {
    outputPath: string;
    platform: string;
    md5Cache: string;
}

class Builder {
    async getConfig(): Promise<BuilderOptions[]> {
        if (v2) {
            return [];
        } else {
            let ret: BuilderOptions[] = [];
            // @ts-ignore
            let cfg = await Editor.Profile.getConfig('builder', 'BuildTaskManager.taskMap', 'local');
            Object.keys(cfg).forEach(key => {
                const item: any = cfg[key].options;
                if (item) {
                    const fullPath = adaptation.Util.urlToFspath(item.buildPath);
                    const outputPath = fullPath ? Path.join(fullPath, item.outputName) : item.buildPath;
                    ret.push({
                        outputPath: outputPath,
                        platform: item.platform,
                        md5Cache: item.md5Cache,
                    })
                }
            })
            return ret;
        }
    }
}

// 为啥取这个名字，因为被Editor编辑器占用了
class CCEditor {
    get path(): string {
        if (v2) {
            //@ts-ignore
            return Editor.appPath;
        } else {
            //@ts-ignore
            return Editor.App.path;
        }
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

class Dialog {
    async select(options: SelectDialogOptions) {
        if (v2) {
            throw new Error('需要适配下');
            //@ts-ignore
            return Editor.Dialog.openFile(options)
        } else {
            // @ts-ignore
            const ret = await Editor.Dialog.select(options);
            return ret.filePaths || [];
        }
    }
}

export class Adaptation {
    public Util = new Util();
    public Project = new Project();
    public Panel = new Panel();
    public CCEditor = new CCEditor();
    public AssetDB = new AssetDB();
    public Shell = new Shell();
    public Dialog = new Dialog();
    public Builder = new Builder();

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
            return Editor.url(string)
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

    init(pluginConfig: CocosPluginConfig, isV2: boolean = true) {
        config = pluginConfig;
        v2 = !!isV2;
    }
}

adaptation = new Adaptation();

export default adaptation;
