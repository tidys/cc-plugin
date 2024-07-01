import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { Base } from './base'
import { basename, dirname, join } from 'path';
import { UrlWithParsedQuery, UrlWithStringQuery, parse } from "url"

export class Util extends Base {
    /**
     * 将长ID 压缩为 短ID
     */
    compressUuid(longUUID: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            const uuid = Editor.Utils.UuidUtils.compressUuid(longUUID);
            return uuid;
        } else {

        }
        return ""
    }

    /**
     * 将短ID 解压为 长ID
     */
    decompressUuid(shortUUID: string) {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            const uuid = Editor.Utils.UuidUtils.decompressUuid(shortUUID);
            return uuid;
        } else {

        }
        return ''
    }
    fspathToUuid(fspath: string): string {
        if (this.adaptation.Env.isPluginV2) {
            if (this.adaptation.isProcessRenderer) {
                // @ts-ignore
                return Editor.assetdb.remote.fspathToUuid(fspath) || ''
            } else {
                // @ts-ignore
                return Editor.assetdb.fspathToUuid(fspath) || ''
            }
        } else {

        }
        return ''
    }
    fspathToUrl(fspath: string): string | null {
        if (this.adaptation.Env.isPluginV2) {
            if (this.adaptation.isProcessRenderer) {
                // @ts-ignore
                return Editor.assetdb.remote.fspathToUrl(fspath) || "";

            } else {
                // @ts-ignore
                return Editor.assetdb.fspathToUrl(fspath) || "";
            }
        } else {
            // 暂时不想使用编辑器的接口
            // Editor.Message.request("asset-db",'query-uuid',url);
            const projectPath = this.adaptation.Project.path;
            const packageDir = join(projectPath, 'extensions');
            const assetDir = join(projectPath, 'assets');
            if (fspath.includes(packageDir)) {
                return fspath.replace(packageDir, 'packages:/')
            } else if (fspath.includes(assetDir)) {
                return fspath.replace(assetDir, 'db:/')
            } else {
                return null;
            }
        }
    }
    urlToUuid(url: string): string {
        if (this.adaptation.Env.isPluginV2) {
            if (this.adaptation.isProcessRenderer) {
                // @ts-ignore
                return Editor.assetdb.remote.urlToUuid(url) || ''
            } else {
                // @ts-ignore
                return Editor.assetdb.urlToUuid(url) || ''
            }
        } else {

        }
        return ''
    }
    public init() {
        let root = join(__dirname, "../..");
        const name = basename(root);
        if (this.adaptation.Env.isPluginV2) {
            if (name !== 'packages') {
                root = "";
            }
        } else if (this.adaptation.Env.isPluginV3) {
            if (name !== 'extensions') {
                root = "";
            }
        }
        if (root && existsSync(root)) {
            const files = readdirSync(root);
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fullPath = join(root, file);
                if (!statSync(fullPath).isDirectory()) {
                    continue;
                }
                const pkg = join(fullPath, 'package.json');
                if (!existsSync(pkg)) {
                    continue;
                }
                try {
                    const pkgJson = JSON.parse(readFileSync(pkg, 'utf-8'))
                    if (pkgJson.name) {
                        this.setPackageUrlRealPath(pkgJson.name, fullPath)
                    }
                } catch {
                    continue;
                }
            }
        }
    }
    // creator有时安装插件的目录名字并不一定是插件的名字
    // 记录下url映射的真实目录，在获取失败的时候，使用这个映射重新获取
    private packageUrlMap: Record<string, string> = {};
    setPackageUrlRealPath(url: string, realPath: string) {
        this.packageUrlMap[url] = realPath;
    }
    private getPackageUrlRealPath(result: UrlWithStringQuery, pluginDir: string, r1: string): string {
        let pkgPath = join(this.adaptation.Project.path, pluginDir, r1)
        if (!pkgPath || !existsSync(pkgPath)) {
            if (!result.hostname) {
                return "";
            }
            if (!result.pathname) {
                return "";
            }
            const mapPath = this.packageUrlMap[result.hostname];
            if (mapPath) {
                pkgPath = join(mapPath, result.pathname);
            }
        }
        if (!pkgPath || !existsSync(pkgPath)) {
            // 如果还是获取不到path，就只能返回空字符
            pkgPath = "";
        }
        return pkgPath;
    }
    urlToFspath(url: string): string {
        let result = parse(url);
        let r1 = result.pathname
            ? join(result.hostname || "", result.pathname)
            : join(result.hostname || "");
        if (this.adaptation.Env.isPluginV2) {
            // const { uuidToUrl, uuidToFspath, urlToFspath, fspathToUuid } = Editor.remote.AssetDB.assetdb;
            if (result.protocol === 'packages:') {
                return this.getPackageUrlRealPath(result, 'packages', r1)
            } else if (result.protocol === 'db:') {
                return join(this.adaptation.Project.path, r1)
            } else if (result.protocol === 'project:') {
                return join(this.adaptation.Project.path, r1)
            } else if (existsSync(url)) {
                return url;
            }
            return "";
        } else if (this.adaptation.Env.isWeb) {
            if (result.protocol === 'packages:') {
                const pluginName = this.adaptation.config!.manifest.name;
                const arr = r1.replace(/\\/g, '/').split("/").filter(item => !!item);
                if (arr.length && arr[0] === pluginName) {
                    arr.shift();
                }
                r1 = arr.join("/");
            }
            return r1;
        } else if (this.adaptation.Env.isPluginV3) {
            if (result.protocol === 'packages:') {
                return this.getPackageUrlRealPath(result, 'extensions', r1)
            } else if (result.protocol === 'db:') {
                return join(this.adaptation.Project.path, r1)
            } else if (result.protocol === 'project:') {
                return join(this.adaptation.Project.path, r1)
            } else if (existsSync(url)) {
                return url;
            }
            return "";
        }
        return "";
    }
    getProperty(keys: Array<string[]>): any {
        for (let i = 0; i < keys.length; i++) {
            const keyArray = keys[i];
            let obj: any = window;
            for (let j = 0; j < keyArray.length; j++) {
                const key = keyArray[j];
                if (obj.hasOwnProperty(key)) {
                    obj = obj[key];
                    if (j === keyArray.length - 1) {
                        return obj;
                    }
                } else {
                    break;
                }
            }
        }
        return null;
    }
}