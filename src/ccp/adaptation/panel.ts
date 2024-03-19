import { Base } from "./base";

export class Panel extends Base {
    private getPanelKey(panel: string): string | null {
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
                    return null;
                }
            }
            // todo 区分v2和v3
            return `${panelName}.${panelID}`;
        }
        return null;
    }
    open(panel: string) {
        const panelKey = this.getPanelKey(panel);
        if (panelKey) {
            //@ts-ignore
            Editor.Panel.open(panelKey);
        }
    }

    close() {

    }
    /**
     * @param panel 主进程接受消息的面板名字，如：self.panelID，也可以是其他插件的面板，格式为 pluginName.panelID
     * @param functionName 定义在messages里面的函数名
     * @param args 参数
     */
    public send(panel: string, functionName: string, ...args: any): boolean {
        if (typeof args === 'function') {
            return false;
        }
        const panelKey = this.getPanelKey(panel);
        if (panelKey) {
            if (this.adaptation.Env.isPluginV2) {
                // @ts-ignore
                Editor.Ipc.sendToPanel(panelKey, functionName, ...args);
                return true;
            } else if (this.adaptation.Env.isPluginV3) {
                // @ts-ignore
                Editor.Message.send(panelKey, functionName, ...args);
                return true;
            }
        }
        return false;
    }
    /**
     * 发送消息给插件的主进程
     * v2版本
     * 需要主进程event.reply(arg1, arg2)才能触发回调，如果没有reply，则不会触发回调
     * @param plugin 插件名，self会自动转换为自己
     * @param functionName 函数名
     * @param args 参数
     * @returns 
     */
    sendToMain(plugin: string, functionName: string, args: string | number | object | boolean | Array<any>, callback?: (arg1: any, arg2: any) => void): boolean {
        if (typeof args === 'function') {
            return false;
        }
        const { manifest, options } = this.adaptation.config!;
        if (plugin === 'self') {
            plugin = manifest!.name;
        }
        if (this.adaptation.Env.isPluginV2) {
            if (this.adaptation.isProcessRenderer) {
                // @ts-ignore
                Editor.Ipc.sendToMain(`${plugin}:${functionName}`, args,
                    (arg1: any, arg2: any) => {
                        // 对应event.reply(arg1, arg2)
                        callback && callback(arg1, arg2);
                    });
                return true;
            }
        }
        return false;
    }
}