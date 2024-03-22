import { CocosPluginConfig, PluginType } from "../declare";
import CCP from "./entry-render";
import * as Path from "path";
import * as Fs from "fs";


export class Profile {
    private Key = 'profile';
    private data: Record<string, any> = {}
    private nativeFile: string = '';// electron环境使用的
    pluginConfig: CocosPluginConfig | null = null;
    public format: boolean = false;

    init(data: Record<string, any>, cfg: CocosPluginConfig) {
        this.defaultData = data;
        this.pluginConfig = cfg;
    }

    private defaultData: Record<string, any> = {};

    save(data: Record<string, any>) {
        if (data) {
            this.data = Object.assign(this.data, data);
        }
        this._write();
    }

    load(fileName: string): Record<string, any> {
        if (this.pluginConfig) {
            const data = this._read(fileName);
            this.data = Object.assign(this.defaultData, data);// merge default data
        }
        return this.data;
    }

    public _read(fileName: string) {
        this.Key = fileName;
        let retData: Record<string, any> = {}
        if (CCP.Adaptation.Env.isWeb) {
            // 从localstorage中读取
            const str = localStorage.getItem(this.Key);
            if (str) {
                try {
                    retData = JSON.parse(str);
                } catch (e) {
                    retData = this.defaultData;
                }
            }
        } else {
            // 不再调用编辑器接口,设置统一放在项目目录下
            const filePath = Path.join(CCP.Adaptation.Project.path, 'settings', fileName);
            this.nativeFile = filePath;
            if (!Fs.existsSync(filePath)) {
                Fs.writeFileSync(filePath, JSON.stringify(this.defaultData), 'utf-8');
                retData = this.defaultData;
            } else {
                const data = Fs.readFileSync(filePath, 'utf-8');
                try {
                    retData = JSON.parse(data);
                } catch (e) {
                    retData = this.defaultData;
                }
            }
        }
        return retData;
    }

    private _write() {
        const str = JSON.stringify(this.data, null, this.format ? 4 : 0);
        if (CCP.Adaptation.Env.isWeb) {
            try {
            // Setting the value exceeded the quota.
                localStorage.setItem(this.Key, str);
            } catch (e) {
                console.log(e);
            }
        } else {
            Fs.writeFileSync(this.nativeFile, str, 'utf-8')
        }
    }
}

export default new Profile();