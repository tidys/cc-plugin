import * as Fs from "fs";
import { ensureFileSync } from "fs-extra";
import { homedir } from "os";
import * as Path from "path";
import { CocosPluginConfig, PluginType } from "../declare";
import CCPRender from "./entry-render";
import CCPMain from "./entry-main";
import { enc, AES, MD5 } from 'crypto-js'

export class Profile {

    private Key = 'profile';
    private data: Record<string, any> = {}
    private nativeFile: string = '';// electron环境使用的
    pluginConfig: CocosPluginConfig | null = null;
    public format: boolean = false;
    public formatIndent: number = 4;
    /**
     * 加密key，目前仅针对web运行环境生效。
     * 
     * __DEV__环境为了方便测试，不会进行加密。
     * 
     * 发布后，才会生效，存储的key也会加密。
     * 
     */
    private encryptKey: string = 'cc-plugin';
    /**
     * 配置文件是否放在全局
     */
    private global: boolean = false;
    constructor(global: boolean = false) {
        this.global = global;
    }
    init(data: Record<string, any>, cfg: CocosPluginConfig, encryptKey: string = 'cc-plugin') {
        this.defaultData = data;
        this.pluginConfig = cfg;
        this.encryptKey = encryptKey;
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
        } else {
            console.log('profile need init');
        }
        return this.data;
    }
    private getLocalStoreFile() {
        if (this.global) {
            return Path.join(homedir(), '.ccp', 'profile', this.Key);
        } else {
            return Path.join(this.Adaptation.Project.path, 'settings', this.Key);
        }
    }
    public get Adaptation() {
        if (typeof process !== 'undefined') {
            if (process['type'] === 'renderer') {
                return CCPRender.Adaptation;
            }
            return CCPMain.Adaptation;
        } else {
            return CCPRender.Adaptation;
        }
    }
    private decode(str: string) {
        return AES.decrypt(str, this.encryptKey).toString(enc.Utf8);
    }
    private encode(str: string): string {
        return AES.encrypt(str, this.encryptKey).toString();
    }
    /**
     * 是否强制加密
     */
    public forceEncrypt: boolean = false;
    public isEncrypt() {
        return !__DEV__ || this.forceEncrypt;
    }
    public _read(fileName: string) {
        this.Key = fileName;
        let retData: Record<string, any> = {}
        if (this.Adaptation.Env.isWeb || this.Adaptation.Env.isChrome) {
            // 从 local storage 中读取
            if (this.isEncrypt()) {
                const uuid = MD5(this.Key).toString(enc.Hex);
                this.Key = uuid;
            }
            let str = localStorage.getItem(this.Key);
            if (str) {
                try {
                    if (this.isEncrypt()) {
                        str = this.decode(str);
                    }
                    retData = JSON.parse(str);
                } catch (e) {
                    retData = this.defaultData;
                }
            } else {
                retData = this.defaultData;
            }
        } else {
            // 不再调用编辑器接口,设置统一放在项目目录下
            const filePath = this.getLocalStoreFile();
            this.nativeFile = filePath;
            if (!Fs.existsSync(filePath)) {
                ensureFileSync(filePath);
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
        let str = JSON.stringify(this.data, null, this.format ? (this.formatIndent || 4) : 0);
        if (this.Adaptation.Env.isWeb || this.Adaptation.Env.isChrome) {
            try {
                if (this.isEncrypt()) {
                    str = this.encode(str);
                }
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