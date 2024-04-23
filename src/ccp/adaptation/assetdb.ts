import { Base } from "./base";
import axios from 'axios';

const Path = require('path'); // 为了适配浏览器
export enum AssetsType {
    All = 'all',
    Texture = 'texture'
}
export interface AssetsInfo {
    url: string;
    type: AssetsType;
    uuid: string;
    path: string;
}
export class AssetDB extends Base {
    refresh(url: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Editor.assetdb.refresh(url);
        } else {
            // 暂时不需要实现，编辑器会自动刷新
        }
    }
    async queryAssets(assetType: AssetsType = AssetsType.Texture): Promise<AssetsInfo[]> {
        if (this.adaptation.Env.isPluginV2) {
            const typeMap = {};
            typeMap[AssetsType.Texture] = 'texture';
            return new Promise((resolve, reject) => {
                // @ts-ignore
                Editor.assetdb.queryAssets('db://assets/**\/*', typeMap[assetType], function (error, results) {
                    if (error) {
                        console.log(error);
                        resolve([])
                        return;
                    }
                    const ret: AssetsInfo[] = [];
                    results.forEach((item: any) => {
                        // creator的数据
                        const { destPath, hidden, isSubAsset, path, readonly, type, url, uuid } = item;
                        ret.push({
                            url: url,
                            path: path,
                            uuid: uuid,
                            type: assetType,
                        })
                    })
                    resolve(ret);
                })
            });
        } else if (this.adaptation.Env.isPluginV3) {

        } else {

        }
        return []
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

