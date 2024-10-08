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

class DropFile {
    buffer: ArrayBuffer | null = null;
    ext: string = "";
    name: string = "";
    support: boolean = true;
    valid: boolean = false;
    file: File | null = null;
    init(itemFile: DataTransferItem) {
        if (itemFile.kind !== 'file') {
            this.valid = false;
            return;
        }
        this.file = itemFile.getAsFile();
        if (!this.file) {
            this.valid = false;
            return;
        }
        const entry = itemFile.webkitGetAsEntry();
        if (!entry) {
            this.valid = false;
            return;
        }
        const { isFile } = entry;
        if (!isFile) {
            this.valid = false;
            return;
        }
        // 在creator中有file.path，其指向磁盘路径
        // 在web中 file.name === entry.name
        // @ts-ignore
        this.name = this.file.path || this.file.name || entry.name;
        this.ext = extname(this.name);
        if (!this.ext) {
            return;
        }
        this.valid = true;
    }
    async getBuffer(): Promise<ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            if (this.valid && this.file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = event.target!.result as ArrayBuffer;
                    this.buffer = data;
                    resolve(data);
                };
                reader.onerror = (event) => {
                    reject(null);
                };
                reader.readAsArrayBuffer(this.file);
            } else {
                reject(null);
            }
        });
    }
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
                    this.map['.ttf'] = this.dropFont;
                    break;
                }
                case Accept.Texture: {
                    this.map['.png'] = this.dropTexture;
                    this.map['.jpg'] = this.dropTexture;
                    this.map['.jpeg'] = this.dropTexture;
                    break;
                }
                case Accept.JSON: {
                    this.map['.json'] = this.dropJson;
                    break;
                }
                case Accept.PLIST: {
                    this.map['.plist'] = this.dropPlist;
                    break;
                }
                case Accept.JSC: {
                    this.map['.jsc'] = this.dropJSC;
                    break;
                }
                case Accept.JS: {
                    this.map['.js'] = this.dropJS;
                    break;
                }
                case Accept.TS: {
                    this.map['.ts'] = this.dropTS;
                    break;
                }
                case Accept.ATLAS: {
                    this.map['.atlas'] = this.dropAtlas;
                    break;
                }
                case Accept.ETC: {
                    this.map['.pkm'] = this.dropEtc;
                    break;
                }
                case Accept.PVR: {
                    this.map['.pvr'] = this.dropPvr;
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
    public async onWeb(event: DragEvent): Promise<void> {
        if (!event.dataTransfer) {
            return;
        }
        const { items, files } = event.dataTransfer;
        if (!items || items.length <= 0) {
            // 暂时不处理非chrome环境
            return;
        }
        const dtItems: DataTransferItem[] = [];
        if (this.options.multi === true) {
            for (let i = 0; i < items.length; i++) {
                dtItems.push(items[i]);
            }
        } else {
            const itemFile = items[0];
            dtItems.push(itemFile);
        }
        const task: Promise<any>[] = [];
        const dropFiles: DropFile[] = [];
        for (let i = 0; i < dtItems.length; i++) {
            const itemFile = dtItems[i];
            const df = new DropFile();
            df.init(itemFile);
            if (df.valid) {
                dropFiles.push(df);
                // 这里不能异步，会导致items数据丢失，应该先存在来
                const p = df.getBuffer();
                if (p) {
                    task.push(p);
                }
            }
        }
        await Promise.all(task);
        for (let i = 0; i < dropFiles.length; i++) {
            const df = dropFiles[i];
            // 依靠callback知道是否支持文件类型，其实不太好
            const cb = this.map[df.ext.toLocaleLowerCase()] || this.options.any || null;
            if (cb) {
                await cb.call(this, df.name, df.buffer);
            } else {
                this.tipsNotSupported(df.name);
            }
        }
    }
    public async onCreator(event: DragEvent): Promise<void> {
        await this.onWeb(event);
        return;
    }
}
