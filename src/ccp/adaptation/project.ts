import { Base } from "./base";

import { versionApi, Versions } from '../version-api';
const { V246, V247, V248, V249, V2410, V2411, V2412, V2413, V2414 } = Versions;

export class Project extends Base {
    public isValid(projPath: string) { }
    private _path: string = '';
    set path(value: string) {
        if (this.adaptation.Env.isWeb) {
            this._path = value;
        } else {
            console.warn(`not supported set project path`)
        }
    }
    get path(): string {
        if (this.adaptation.Env.isPluginV2) {
            if (this._path) {
                return this._path;
            }
            this._path = this.adaptation.Util.getProperty([
                ["Editor", "Project", 'path'],
                ['Editor', 'projectInfo', 'path']
            ]) || "";
            return this._path;
            return versionApi(
                this.adaptation.CCEditor.version,
                [
                    {
                        version: [V246, V247, V248, V249, V2410, V2411, V2412, V2413, V2414],
                        fn: () => {
                            // @ts-ignore
                            return Editor.Project.path;
                        }
                    }
                ],
                () => {
                    // @ts-ignore
                    return Editor.projectInfo.path;
                })
        } else if (this.adaptation.Env.isWeb) {
            return this._path;
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            return Editor.Project.path;
        } else {

        }
        return ''
    }
}