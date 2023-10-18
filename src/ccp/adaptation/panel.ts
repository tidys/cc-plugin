import { Base } from "./base";

export class Panel extends Base {
    open(panel: string) {
        const array = panel.split('.');
        if (array.length >= 2) {
            let [panelName, panelID] = array;
            if (!this.adaptation.config) {
                throw new Error(`未设置config`)
            }
            const { manifest, options } = this.adaptation.config!;
            // if (options?.version === PluginVersion.v2) { }
            if (panelName === 'self') {
                panelName = manifest!.name
                // 查找panelID是否存在
                if (!manifest?.panels?.find(el => el.name === panelID)) {
                    console.error(`open failed: ${panel}`)
                    return
                }
            }
            //@ts-ignore
            Editor.Panel.open(`${panelName}.${panelID}`);
        }
    }

    close() {

    }

}