import { BuilderOptions, CocosPluginConfig, PanelOptions, Platform, PluginType, Panel as PanelType } from '../../declare';

import { Util } from "./util"
import { Env } from './env'
import { Simulator } from './simulator';
import { Project } from './project';
import { Panel } from './panel';
import { CCEditor } from './editor';
import { AssetDB } from './assetdb';
import { Shell } from './shell';
import { Dialog } from './dialog';
import { Builder } from './builder';
import { Log } from './log';
import { Menu } from './menu';
import { Download } from './download';
import { IP } from './ip';
export class Adaptation {
    public config: CocosPluginConfig | null = null;
    public options: PanelOptions | null = null;

    public Util = new Util(this);
    public Env = new Env(this);
    public Simulator = new Simulator(this);
    public Project = new Project(this);
    public Panel = new Panel(this);
    public CCEditor = new CCEditor(this);
    public AssetDB = new AssetDB(this);
    public Shell = new Shell(this);
    public Dialog = new Dialog(this);
    public Builder = new Builder(this);
    public Log = new Log(this);
    public Menu = new Menu(this);
    public Download = new Download(this);
    public IP = new IP(this);

    public require(name: string): any {
        if (this.Env.isPluginV2) {
            // @ts-ignore
            return Editor.require(`packages://${config.manifest!.name}/node_modules/${name}`);
        } else {
            const url = `packages://${this.config!.manifest!.name}/node_modules/${name}`;
            const fsPath = this.Util.urlToFspath(url);
            if (fsPath) {
                return eval('require(`${fsPath}`)');
                // return require(fsPath)
            }
            return null;
        }
    }

    public url(url: string) {
        if (this.Env.isPluginV2) {
            // @ts-ignore
            return Editor.url(url);
        } else {
            return this.Util.urlToFspath(url);
        }
    }

    public log(str: string) {
        if (this.Env.isPluginV2) {
            // @ts-ignore
            Editor.log(str);
        } else {
            console.log(str);
        }
    }

    init(pluginConfig: CocosPluginConfig) {
        this.Env.init();
        // FIXME: uitl.init会调用编辑器的接口，而Floating类型的面板，是没法调用EditorAPI的，暂时只能通过面板类型进行识别
        if (typeof __PANEL__ !== 'undefined') {
            if (__PANEL__.type !== PanelType.Type.Floating) {
                this.Util.init();
            }
        } else {
            this.Util.init();
        }
        this.config = pluginConfig;
    }
    get isProcessRenderer() {
        // @ts-ignore
        return process.type === 'renderer';
    }
}

