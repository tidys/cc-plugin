import { existsSync, readFileSync } from "fs";
import { Base } from "./base";
import axios from 'axios';
import { basename, dirname, extname, join, normalize, sep } from "path";
import { UrlWithParsedQuery, UrlWithStringQuery, parse } from "url"

const Path = require('path'); // 为了适配浏览器
export enum AssetsType {
    All = 'all',
    Texture = 'texture',
    Audio = 'audio',
}
export class AssetsInfo {
    url: string;
    /** engine的原始类型 */
    originType: string;
    /**
     * 子资源，plist
     */
    sub: string = "";
    type: AssetsType;
    uuid: string;
    /**
     * 文件的磁盘路径
     */
    path: string;
}
export interface ImportResult {
    uuid: string;
    url: string;
    path: string;
    type: string;
}
export class AssetDB extends Base {
    /**
     * 判断目录是否在assets下边
     */
    public isUnderAssets(file: string) {
        if (this.adaptation.Env.isPlugin) {
            file = file.replace(/\\/g, "/");
            let assetsPath = join(this.adaptation.Project.path, "assets").replace(/\\/g, "/");;
            if (file.indexOf(assetsPath) === 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * 
     * @param uuid 删除资源的uuid
     */
    async delete(uuid: string) {
        if (this.adaptation.Env.isPluginV2) {

        } else if (this.adaptation.Env.isPluginV3) {
            const fspath = await this.adaptation.Util.uuidToFspath(uuid);
            const url = this.adaptation.Util.fspathToUrl(fspath);
            // @ts-ignore
            Editor.Message.request('asset-db', 'delete-asset', uuid);
        }
    }
    /**
     * 导入文件到项目中，如果导入失败，则会返回空数组
     * @param files 导入的文件，绝对路径
     * @param url 导入到项目的地址，比如： db://assets/
     */
    async import(files: string[], url: string): Promise<Array<ImportResult>> {
        const ret: ImportResult[] = [];
        if (this.adaptation.Env.isWeb) {
            return ret;
        } else if (this.adaptation.Env.isPluginV2) {
            return new Promise((resolve, reject) => {
                // @ts-ignore
                Editor.assetdb.import(files, url, (err: number, results: Array<{ url: string; parentUuid: string, uuid: string, path: string, type: string }>) => {
                    if (err) {
                        resolve(ret);
                    } else {
                        results.forEach((result) => {
                            ret.push({
                                uuid: result.uuid,
                                url: result.url,
                                path: result.path,
                                type: result.type
                            })
                        });
                        resolve(ret);
                    }

                });
            });

        } else if (this.adaptation.Env.isPluginV3) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (existsSync(file)) {
                    const urlFs = this.adaptation.Util.urlToFspath(url)
                    const fileUrl = this.adaptation.Util.fspathToUrl(join(urlFs, basename(file)));
                    // @ts-ignore
                    const result = await Editor.Message.request("asset-db", "import-asset",
                        file, // 本地文件的绝对路径
                        fileUrl, // 导入数据库的url地址
                        {
                            overwrite: true,// 强制覆盖
                            rename: true,// 冲突时否自动更名，默认 false
                        }
                    );
                    ret.push({
                        uuid: result.uuid || "",
                        url: result.url || "",
                        path: result.file || "",
                        type: result.type || "", // cc.ImageAsset ...
                    })
                }
            }
        }
        return ret;
    }
    refresh(url: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Editor.assetdb.refresh(url);
        } else {
            // @ts-ignore
            Editor.Message.request('asset-db', 'refresh-asset', url);
        }
    }
    hint(uuid: string) {
        if (this.adaptation.Env.isPluginV2) {

        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            Editor.Message.broadcast("ui-kit:touch-asset", uuid);
        }
    }
    async queryAssets(
        assetType: AssetsType = AssetsType.Texture,
        options: {
            /**是否只检索文件，过滤掉目录 */
            onlyFiles?: boolean
            /**
             * 对查询结果进行过滤，返回true则会返回该资源
             */
            filter?: (data: any, info: AssetsInfo) => boolean,
        } = {}): Promise<AssetsInfo[]> {
        const typeMap = {};
        if (this.adaptation.Env.isPluginV2) {
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
                        const info = new AssetsInfo();
                        info.url = url;
                        info.path = path;
                        info.uuid = uuid;
                        info.originType = type;
                        info.type = assetType;

                        if (options.filter) {
                            if (options.filter(item, info)) {
                                ret.push(info);
                            }
                        } else {
                            ret.push(info)
                        }
                    })
                    resolve(ret);
                })
            });
        } else if (this.adaptation.Env.isPluginV3) {
            typeMap[AssetsType.Texture] = 'image';
            typeMap[AssetsType.All] = '';
            // @ts-ignore
            const results = await Editor.Message.request("asset-db", "query-assets", {
                pattern: "db://assets/**/*",
                type: typeMap[assetType],//scripts, scene, effect, image
            });
            const ret: AssetsInfo[] = [];
            results.forEach((item: any) => {
                // creator的数据
                const { isDirectory, visible, file, path, readonly, type, url, uuid } = item;
                let canPush = true;
                if (options.onlyFiles && isDirectory) {
                    canPush = false;
                }
                if (canPush) {
                    const info = new AssetsInfo();
                    info.url = url;
                    if (type === 'cc.SpriteFrame') {
                        // cc.SpirteFrame没有file，使用磁盘文件
                        const arr = normalize(url).split(sep)
                        const sub = arr.pop();
                        if (sub === "spriteFrame") {
                            info.sub = "";
                        } else {
                            info.sub = sub!;
                        }
                        const texturUrl = arr.join("/");
                        info.path = this.adaptation.Util.urlToFspath(texturUrl);
                    } else {
                        info.path = file
                    }
                    info.uuid = uuid;
                    info.originType = type;
                    info.type = assetType;
                    if (options.filter) {
                        if (options.filter(item, info)) {
                            ret.push(info);
                        }
                    } else {
                        ret.push(info)
                    }
                }
            })
            return ret;
        } else {

        }
        return []
    }
    /**
     * 
     * @param uuid 要打开的资源的uuid
     */
    async open(uuid: string) {
        if (this.adaptation.Env.isPluginV3) {
            //@ts-ignore
            await Editor.Message.request("asset-db", "open-asset", uuid)
        }
    }
    create(url: string, data: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Editor.assetdb.create(url, data, function (err, result) {
                console.log(err, result);
            });
        } else {
            // @ts-ignore
            Editor.Message.request("asset-db", "create-asset", url, data);
        }
    }
    /**
     * 
     * @param url 存储的路径url
     * @param nodeUUID 场景中的节点UUID
     * @returns 新创建资源的UUID
     */
    async createPrefab(url: string, nodeUUID: string): Promise<string> {
        if (this.adaptation.Env.isPluginV2) {

        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            const ret = await Editor.Message.request("scene", "create-prefab", nodeUUID, url);
            console.log(ret);
            return ret || ""
        }
        return ""
    }
    createScene() {

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

