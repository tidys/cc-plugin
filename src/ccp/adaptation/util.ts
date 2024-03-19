import { Base } from './base'
const Path = require('path'); // 为了适配浏览器
const URL = require('url')

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
    fspathToUrl(fspath: string): string | null {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            return Editor.assetdb.remote.fspathToUrl(fspath);
        } else {
            // 暂时不想使用编辑器的接口
            // Editor.Message.request("asset-db",'query-uuid',url);
            const projectPath = this.adaptation.Project.path;
            const packageDir = Path.join(projectPath, 'extensions');
            const assetDir = Path.join(projectPath, 'assets');
            if (fspath.includes(packageDir)) {
                return fspath.replace(packageDir, 'packages:/')
            } else if (fspath.includes(assetDir)) {
                return fspath.replace(assetDir, 'db:/')
            } else {
                return null;
            }
        }
    }

    urlToFspath(url: string) {
        let result = URL.parse(url);
        let r1 = result.pathname
            ? Path.join(result.hostname, result.pathname)
            : Path.join(result.hostname);
        if (this.adaptation.Env.isPluginV2) {
            // const { uuidToUrl, uuidToFspath, urlToFspath, fspathToUuid } = Editor.remote.AssetDB.assetdb;
            throw new Error('没有实现的接口')
        } else if (this.adaptation.Env.isWeb) {
            if (result.protocol === 'packages:') {
                const pluginName = this.adaptation.config!.manifest.name;
                if (r1.startsWith('/')) {
                    r1 = r1.substring(1, r1.length)
                }
                if (r1.startsWith(pluginName)) {
                    r1 = r1.substring(pluginName.length, r1.length)
                }
            }
            return r1;
        } else {
            if (result.protocol === 'packages:') {
                return Path.join(this.adaptation.Project.path, 'extensions', r1)
            } else if (result.protocol === 'db:') {
                return Path.join(this.adaptation.Project.path, r1)
            } else if (result.protocol === 'project:') {
                return Path.join(this.adaptation.Project.path, r1)
            }
            return null;
        }
    }
}