
import { Base } from "./base";
import { writeFileSync } from 'fs'
import { join } from "path";
export class Download extends Base {
    public async downloadFile(fileName: string, data: string, base64: boolean = false): Promise<boolean> {
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
        return await this.downloadBlobFile(fileName, blob);
    }
    /**
     * @example 下载zip的buffer
        const buffer = await zip.generateAsync({ type: "blob", streamFiles: true });
        Download.downloadBlobFile(`${this.options!.version}.zip`, buffer);
     */
    public async downloadBlobFile(fileName: string, blob: Blob): Promise<boolean> {
        function webWay() {
            let aLink = document.createElement('a');
            let evt = document.createEvent('HTMLEvents');
            evt.initEvent('click', true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
            aLink.download = fileName;
            aLink.href = URL.createObjectURL(blob);
            document.body.appendChild(aLink);
            aLink.click();
            document.body.removeChild(aLink);
        }
        if (this.adaptation.Env.isWeb) {
            webWay();
            return true;
        } else if (this.adaptation.Env.isPluginV2) {
            webWay();
            return true;
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            const result = await Editor.Dialog.select({
                path: this.adaptation.Project.path,
                title: 'save file to',
                type: 'directory',
                multi: false,
                filters: [
                    // { name: 'Package', extensions: ['zip'] },
                ],
            })
            // Editor.Dialog.save() 才有 result.canceled
            // if (result.canceled) {
            //     return false;
            // }
            if (!result.filePaths) {
                return false;
            }
            const filePath = result.filePaths[0];
            if (!filePath) {
                return false;
            }
            const fullPath = join(filePath, fileName);
            try {
                writeFileSync(fullPath, Buffer.from(await blob.arrayBuffer()));
                this.adaptation.Shell.showItem(fullPath);
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        }
        return false;
    }
}