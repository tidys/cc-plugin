import { Base } from "./base";



export class Log extends Base {
    error(str: string) {
        if (this.adaptation.Env.isWeb) {
            console.error(str);
        } else {
            // todo 待实现
        }
    }

    log(str: string) {
        if (this.adaptation.Env.isWeb) {
            console.log(str);
        } else if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Editor.log(str);
        }
    }

    info(str: string) {
        if (this.adaptation.Env.isWeb) {
            console.log(str);
        } else {
            // todo 待实现
        }
    }
}
