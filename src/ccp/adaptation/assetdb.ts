import { Base } from "./base";
import axios from 'axios';

const Path = require('path'); // 为了适配浏览器

export class AssetDB extends Base {
    refresh(url: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Editor.assetdb.refresh(url);
        } else {
            // 暂时不需要实现，编辑器会自动刷新
        }
    }
    create(url: string, data: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Editor.assetdb.create(url, data, function (err, result) {
                console.log(err, result);
            });
        } else {

        }
    }

    async fileData(url: string): Promise<string> {
        let fspath = this.adaptation.Util.urlToFspath(url);
        if (fspath) {
            if (this.adaptation.Env.isWeb) {
                const ext = Path.extname(fspath);
                if (!ext) {
                    return ''
                } else {
                    const res = await axios.get(fspath);
                    return res.data;
                }
            }
        }
        return ''
    }
}

