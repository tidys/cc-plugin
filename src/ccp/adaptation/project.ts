import { Base } from "./base";

import { versionApi, Versions } from '../version-api';
const { V246, V247, V248, V249, V2410, V2411 } = Versions;

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
            return versionApi(
                this.adaptation.CCEditor.version,
                [
                    {
                        version: [V246, V247, V248, V249, V2410, V2411],
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