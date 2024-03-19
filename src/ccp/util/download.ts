// TODO: 需要适配native逻辑
export class Download {
    public static downloadFile(fileName: string, data: string, base64: boolean = false) {
        let blob: Blob | null = null;
        if (base64) {
            const raw = window.atob(data);
            const uInt8Array = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            blob = new Blob([uInt8Array], { type: `image/png` });
        } else {
            blob = new Blob([data]);
        }
        this.downloadBlobFile(fileName, blob);
    }
    /**
     * @example 下载zip的buffer
        const buffer = await zip.generateAsync({ type: "blob", streamFiles: true });
        Download.downloadBlobFile(`${this.options!.version}.zip`, buffer);
     */
    public static downloadBlobFile(fileName: string, blob: Blob) {
        let aLink = document.createElement('a');
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent('click', true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
    }
}