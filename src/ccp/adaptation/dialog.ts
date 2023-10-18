import * as Fs from 'fs';
import { Base } from './base';
import { extname } from 'path';

interface DialogMessageOptions {
    /**
     * 对话框内容
     */
    message: string;
    /**
     * 标题
     */
    title?: string;
    type?: "question" | "warning" | "none" | "info" | "error";
    /**
     * 按钮文本数组
     */
    buttons?: Array<string>;
    /**
     * 按钮索引
     */
    defaultId?: number;
    noLink?: boolean;
    /**
     * 通过 Esc 键取消对话框的按钮索引
     */
    cancelId?: number;
}

const DefaultDialogMessageOptions: DialogMessageOptions = {
    type: 'question',
    title: '提示',
    message: '提示消息',
    buttons: ['确定', '取消'],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
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
    fillData?: boolean;
}
const Electron = require('electron');
export class Dialog extends Base {
    /**
     * 目前web平台暂时不支持设置buttons
     */
    message(options: DialogMessageOptions | string): boolean {
        if (typeof options === 'string') {
            options = { message: options };
        }
        options = Object.assign(DefaultDialogMessageOptions, options);
        if (this.adaptation.Env.isWeb) {
            // true 确定，false 取消
            return confirm(options.message || '')
        } else {
            // 0 确定，!0取消
            return !Electron.remote?.dialog.showMessageBoxSync(options);
        }
    }

    async readAsBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target!.result as string);
            };
            if (['image/png', 'image/jpeg'].find(el => el === file.type)) {
                reader.readAsDataURL(file);
            } else {
                console.log('un support file type: ', file.type);
                resolve('');
            }
        });
    }
    async readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fontData = event.target!.result;
                resolve(fontData as ArrayBuffer);
            }
            reader.readAsArrayBuffer(file);
        });
    }
    open(path: string) {
        if (this.adaptation.Env.isWeb) {
            console.warn('not support open： ', path)
        } else {
            if (!Fs.existsSync(path)) {
                return
            }
            if (Fs.statSync(path).isDirectory()) {
                Electron.shell.showItemInFolder(path)
                Electron.shell.beep();
            } else {

            }
        }
    }
    async select(options: SelectDialogOptions): Promise<Record<string, ArrayBuffer | null>> {
        if (this.adaptation.Env.isWeb) {
            return new Promise((resolve, reject) => {
                const inputEl: HTMLInputElement = document.createElement('input');
                inputEl.type = 'file'; // only file
                if (options.type === 'directory') {
                    inputEl.setAttribute('directory', '');
                    inputEl.setAttribute('webkitdirectory', '');
                }
                // web只支持一个filter
                const typeReader: Record<string, (file: File) => Promise<ArrayBuffer>> = {
                    '.png': this.readAsArrayBuffer,
                    '.txt': this.readAsArrayBuffer,
                    '.jpg': this.readAsArrayBuffer,
                    '.jpeg': this.readAsArrayBuffer,
                    '.ttf': this.readAsArrayBuffer,
                };
                if (options.filters?.length) {
                    let accept: string[] = [];
                    const types = Object.keys(typeReader);
                    options.filters![0].extensions.forEach((ext) => {
                        ext = ext.startsWith('.') ? ext : `.${ext}`;
                        const extItem = types.find((el) => el === ext.toLocaleLowerCase());
                        if (extItem) {
                            accept.push(extItem);
                        }
                    });

                    inputEl.accept = accept.join(',');
                }

                inputEl.multiple = !!options.multi;
                inputEl.addEventListener('change', async () => {
                    let ret: Record<string, any> = {};
                    let fillData = true;
                    if (options.fillData === false) {
                        fillData = false;
                    }
                    for (let i = 0; i < inputEl.files!.length; i++) {
                        const file: File = inputEl.files![i];
                        if (fillData) {
                            const type = extname(file.name).toLocaleLowerCase();
                            const readerFunction = typeReader[type];
                            if (readerFunction) {
                                const data: ArrayBuffer = await readerFunction(file);
                                if (data) {
                                    ret[file.name.toString()] = data;
                                }
                            } else {
                                console.warn(`${file.name} no reader`);
                            }
                        } else {
                            ret[file.name.toString()] = '';
                        }
                    }
                    resolve(ret);
                });
                inputEl.dispatchEvent(new MouseEvent('click'));
            });
        } else if (this.adaptation.Env.isPluginV2) {
            // https://www.electronjs.org/zh/docs/latest/api/dialog#dialogshowopendialogsyncbrowserwindow-options
            const dialogOptions = {
                title: options.title,
                defaultPath: options.path,
                properties: [""],
                filters: [],
            }
            if (options.type === 'directory') {
                dialogOptions.properties = ['openDirectory'];
            } else if (options.type === 'file') {
                dialogOptions.properties = ['openFile'];
                // @ts-ignore
                dialogOptions.filters = options.filters || [];
            }
            //@ts-ignore
            const result = Editor.Dialog.openFile(dialogOptions);
            if (result === -1) {
                return {};
            }
            const ret: Record<string, any> = {};
            (result || []).forEach((e: string) => {
                if (options.type === 'file') {
                    ret[e] = Fs.readFileSync(e).buffer;
                } else {
                    ret[e] = null;
                }
            });
            return ret;
        } else {
            const ret: Record<string, any> = {};
            // @ts-ignore
            const result = await Editor.Dialog.select(options);
            (result.filePaths || []).forEach((e: string) => {
                if (options.type === 'file') {
                    ret[e] = Fs.readFileSync(e).buffer;
                } else {
                    ret[e] = null;
                }
            });
            return ret;
        }
    }
}