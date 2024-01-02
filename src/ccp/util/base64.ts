import { md5Data } from './md5';
export class Base64 {
    /**
     * 是否为有效的base64数据
     */
    public static invalid(data: string) {
        return data.startsWith('data:image/jpeg;base64,') || data.startsWith('data:image/png;base64,') || data.startsWith('data:font/ttf;base64');
    }
    /**
     * 将二进制字符串转为base64字符串
     */
    public static transformArrayBuffer(data: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(data);
        for (var len = bytes.byteLength, i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    public static cutHead(data: string): string {
        if (this.invalid(data)) {
            const heads = ['data:image/jpeg;base64,', 'data:image/png;base64,'];
            for (let i = 0; i < heads.length; i++) {
                const head = heads[i];
                if (data.startsWith(head)) {
                    return data.substring(head.length);
                }
            }
        }
        return data;
    }
    /**
     *
     * @param data 没有head的base64数据
     * @param type head的类型，可以直接传递file ext
     * @returns
     */
    public static fillHead(data: string, type: string): string {
        if (this.invalid(data)) {
            return data;
        }
        if (type.startsWith('.')) {
            type = type.substring(1, type.length);
        }
        if (type === 'jpeg' || type === 'jpg') {
            return `data:image/jpeg;base64,${data}`;
        } else if (type === 'png') {
            return `data:image/png;base64,${data}`;
        }
        return data;
    }
    public static async getImageSizeByArrayBuffer(buffer: ArrayBuffer, type: string): Promise<{ width: number; height: number }> {
        const base64 = this.transformArrayBuffer(buffer);
        const fullBase64 = this.fillHead(base64, type);
        return await this.getBase64WidthHeight(fullBase64);
    }
    static async getBase64WidthHeight(base64: string) {
        const img = await this.convertToImageData(base64);
        if (img) {
            return { width: img.width, height: img.height };
        } else {
            return { width: 0, height: 0 };
        }
    }
    /**
     * 缓存加载的image，提高性能
     */
    private static _cachedImage: Record<string, HTMLImageElement> = {};
    public static async convertToImageData(data: string): Promise<HTMLImageElement | null> {
        return new Promise<HTMLImageElement | null>((resolve, reject) => {
            if (!this.invalid(data)) {
                debugger;
                return reject(null);
            }
            const md5 = md5Data(data);
            let image = this._cachedImage[md5];
            if (image) {
                return resolve(image);
            } else {
                image = new Image();
                image.src = data;
                image.onload = () => {
                    this._cachedImage[md5] = image;
                    return resolve(image);
                };
                image.onerror = (e) => {
                    // TODO: 使用生成的图片ArrayBuffer的md5有时还不一样，不知道为啥
                    debugger;
                    reject(null);
                };
            }
        });
    }
}
