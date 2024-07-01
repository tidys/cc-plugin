import { existsSync, readFileSync } from "fs";
import { Base } from "./base";
import axios from 'axios';
import { basename, dirname, extname, join } from "path";
import { UrlWithParsedQuery, UrlWithStringQuery, parse } from "url"

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

    async fileData(url: string): Promise<string | ArrayBuffer> {
        let fspath = this.adaptation.Util.urlToFspath(url);
        if (fspath) {
            if (this.adaptation.Env.isWeb) {
                const ext = Path.extname(fspath);
                if (!ext) {
                    return ''
                } else {
                    // fspath = fspath.replace(/\\/g, '/');
                    // const result = parse(window.location.href);
                    // const dir = dirname(result.path || "").replace(/\\/g, '/')
                    // const arr1 = dir.split('/').filter(item => !!item);
                    // const arr2 = fspath.split('/').filter(item => !!item);
                    // fspath = arr1.concat(arr2).join("/")
                    const res = await axios.get(fspath);
                    return res.data;
                }
            } else if (this.adaptation.Env.isPlugin) {
                if (['.plist', '.json', 'txt', '.atlas', '.log'].includes(extname(fspath))) {
                    return readFileSync(fspath, 'utf-8');
                } else {
                    return readFileSync(fspath).buffer;
                }
            }
        }
        return ''
    }
    getWorkspaceDirectory() {
        return __DEV_WORKSPACE__;
    }
    /**
     * 获取静态文件的全路径，默认不会校验文件是否存在
     * @param file 如果你在静态目录下有个a.png文件，那么这个参数就是a.png
     * @param [check=false] 如果你想校验文件是否存在，那么这个参数设置为true
     */
    getStaticFile(file: string, check: boolean = false) {
        let staticFileDirectory = this.adaptation.config?.options.staticFileDirectory;
        if (!staticFileDirectory) {
            return ""
        }
        if (staticFileDirectory.startsWith('./')) {
            staticFileDirectory = staticFileDirectory.substring(2);
        }
        if (file.startsWith(staticFileDirectory)) {
            file = file.substring(staticFileDirectory.length + 1);
        }
        let ret: string = "";
        if (this.adaptation.Env.isDev) {
            const workspaceDir = this.getWorkspaceDirectory();
            ret = join(workspaceDir, staticFileDirectory, file);
        } else {
            // TODO: check
            const pluginName = this.adaptation.config!.manifest.name;
            const url = `packages://${pluginName}/${staticFileDirectory}/${file}`;
            ret = this.adaptation.Util.urlToFspath(url) || "";
        }

        if (check) {
            if (!existsSync(ret)) {
                return "";
            } else {
                return ret;
            }
        } else {
            return ret;
        }
    }
}

