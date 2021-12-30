import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginVersion } from '../declare';

// 这里面的代码和进程无关了
export class Panel {
    private config: CocosPluginConfig | null = null;

    setConfig(config: CocosPluginConfig) {
        this.config = config;
    }

    open(panel: string) {
        const array = panel.split('.');
        if (array.length >= 2) {
            let [panelName, panelID] = array;
            if (!this.config) {
                return;
            }
            const { manifest, options } = this.config!;
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
