import { PluginVersion } from '../declare';
import { CocosCreatorPlugin } from './index';

export class Panel {
    private plugin: CocosCreatorPlugin | null = null;

    constructor(plugin: CocosCreatorPlugin) {
        this.plugin = plugin;
    }

    open(panel: string) {
        const array = panel.split('.');
        if (array.length >= 2) {
            let [panelName, panelID] = array;

            const { manifest, options } = this.plugin!;
            if (options?.version === PluginVersion.v2) {
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
    }

    close() {

    }
}
