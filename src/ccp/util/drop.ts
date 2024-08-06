import { extname } from 'path';
import adaptation from '../adaptation/index';

type ArrayBufferCallback = (
    /**
     * 文件的路径，在web环境是文件名，在插件环境时文件的绝对路径
     */
    name: string,
    data: ArrayBuffer) => Promise<void>;
type StringCallback = (
    /**
     * 文件的路径，在web环境是文件名，在插件环境时文件的绝对路径
     */
    name: string,
    data: string) => Promise<void>;
export interface DropOptions {
    accept?: Accept[];
    multi?: boolean;
    ttf?: ArrayBufferCallback;
    texture?: ArrayBufferCallback;
    json?: StringCallback;
    plist?: StringCallback;
    jsc?: ArrayBufferCallback;
    js?: StringCallback;
    ts?: StringCallback;
    atlas?: StringCallback;
    pvr?: ArrayBufferCallback;
    etc?: ArrayBufferCallback;
    /**
     * 任何格式的文件，如果没有配置对应格式回调，就会使用该回调
     */
    any?: ArrayBufferCallback;
}
export enum Accept {
    TTF = 'ttf',
    Texture = 'texture',
    JSON = 'json',
    PLIST = 'plist',
    JSC = 'jsc',
    JS = 'js',
    TS = 'ts',
    ATLAS = 'atlas',
    PVR = 'pvr',
    ETC = 'pkm'
}
export class Drop {
    private map: Record<string, ArrayBufferCallback> = {};
    private options: DropOptions;
    constructor(options: DropOptions) {
        this.options = options;
        let { accept } = options;
        if (!accept) {
            accept = [];
            const keys = Object.keys(Accept);
            keys.forEach((key) => accept!.push(Accept[key]));

        }
        for (let i = 0; i < accept.length; i++) {
            switch (accept[i]) {
                case Accept.TTF: {
                    this.map['.ttf'] = this.dropFont.bind(this);
                    break;
                }
                case Accept.Texture: {
                    this.map['.png'] = this.dropTexture.bind(this);
                    this.map['.jpg'] = this.dropTexture.bind(this);
                    this.map['.jpeg'] = this.dropTexture.bind(this);
                    break;
                }
                case Accept.JSON: {
                    this.map['.json'] = this.dropJson.bind(this);
                    break;
                }
                case Accept.PLIST: {
                    this.map['.plist'] = this.dropPlist.bind(this);
                    break;
                }
                case Accept.JSC: {
                    this.map['.jsc'] = this.dropJSC.bind(this);
                    break;
                }
                case Accept.JS: {
                    this.map['.js'] = this.dropJS.bind(this);
                    break;
                }
                case Accept.TS: {
                    this.map['.ts'] = this.dropTS.bind(this);
                    break;
                }
                case Accept.ATLAS: {
                    this.map['.atlas'] = this.dropAtlas.bind(this);
                    break;
                }
                case Accept.ETC: {
                    this.map['.pkm'] = this.dropEtc.bind(this);
                    break;
                }
                case Accept.PVR: {
                    this.map['.pvr'] = this.dropPvr.bind(this);
                    break;
                }
            }
        }
    }
    private tipsNotSupported(name: string) {
        adaptation.Dialog.message({
            type: 'warning',
            buttons: ['OK'],
            title: 'warn',
            message: `Unsupported file types:${name}`,
            noLink: true,
        });
    }
    private async dropFont(name: string, data: ArrayBuffer) {
        const { ttf } = this.options;
        ttf && await ttf(name, data);
    }
    private async dropTexture(name: string, data: ArrayBuffer) {
        const { texture } = this.options;
        texture && await texture(name, data);
    }
    private async dropJSC(name: string, data: ArrayBuffer) {
        const { jsc } = this.options;
        jsc && await jsc(name, data);
    }
    private async dropJS(name: string, data: ArrayBuffer) {
        const { js } = this.options;
        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(data);
        js && await js(name, str);
    }
    private async dropTS(name: string, data: ArrayBuffer) {
        const { ts } = this.options;
        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(data);
        ts && await ts(name, str);
    }
    private async dropJson(name: string, data: ArrayBuffer) {
        const { json } = this.options;
        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(data);
        json && await json(name, str);
    }
    private async dropAtlas(name: string, data: ArrayBuffer) {
        const { atlas } = this.options;
        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(data);
        atlas && await atlas(name, str);
    }
    private async dropPlist(name: string, data: ArrayBuffer) {
        const { plist } = this.options;
        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(data);
        plist && await plist(name, str);
    }
    private async dropPvr(name: string, data: ArrayBuffer) {
        const { pvr } = this.options;
        pvr && await pvr(name, data)
    }

    private async dropEtc(name: string, data: ArrayBuffer) {
        const { etc } = this.options;
        etc && await etc(name, data)
    }
    private _onWebOne(itemFile: DataTransferItem) {
        if (itemFile.kind !== 'file') {
            return;
        }
        const entry = itemFile.webkitGetAsEntry();
        if (!entry) {
            return;
        }
        const file = itemFile.getAsFile();
        if (!file) { return; }
        // 在creator中有file.path，其指向磁盘路径
        // 在web中 file.name === entry.name
        // @ts-ignore
        const name = file.path || file.name || entry.name;
        const { isFile } = entry;
        if (!isFile) {
            return;
        }
        const ext = extname(name);
        if (!ext) {
            return;
        }
        // 依靠callback知道是否支持文件类型，其实不太好
        let cb = this.map[ext.toLocaleLowerCase()] || this.options.any || null;
        if (!cb) {
            this.tipsNotSupported(name);
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target!.result;
            (async () => {
                await cb(name, data as ArrayBuffer);
            })();
        };
        reader.readAsArrayBuffer(file);
    }
    public onWeb(event: DragEvent): void {
        if (!event.dataTransfer) {
            return;
        }
        const { items, files } = event.dataTransfer;
        if (!items || items.length <= 0) {
            // 暂时不处理非chrome环境
            return;
        }
        if (this.options.multi === true) {
            for (let i = 0; i < items.length; i++) {
                const itemFile = items[i];
                this._onWebOne(itemFile);
            }
        } else {
            const itemFile = items[0];
            this._onWebOne(itemFile);
        }
    }
    public onCreator(event: DragEvent): void {
        this.onWeb(event);
        return;
    }
}
