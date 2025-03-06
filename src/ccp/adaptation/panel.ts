import { Base } from "./base";
import { getV3MethodFunctionName, getV3PanelRecvMessageFunctionName } from '../../common'
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
     * 
     * 在V3中， function作为了参数发送到了面板
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
                const [pluginID, panelName] = panelKey.split(".");
                const messageKey = getV3PanelRecvMessageFunctionName(panelName);
                // @ts-ignore
                Editor.Message.send(pluginID, messageKey, functionName, ...args);
                return true;
            }
        }
        return false;
    }
    /**
     * 发送消息给插件的主进程（目前仅仅在v2中实现了）
     * 
     * @param plugin 接收消息的插件名，如果要发送给插件自身，使用`self`即可。
     * @param functionName 定义在主进程的消息函数名，也就是cc-plugin的main.ts里面的messages
     * @param args 目标插件主进程接收到的参数，如果要传递的参数比较多，建议使用`Object/Array`，需要注意的是`Object/Array`必须为可被JSON序列化的数据。
     * @param callback 消息回调函数，需要目标插件的主进程`event.reply(0, args)`才能触发回调，如果没有reply，则不会触发回调
     * @returns 
     * 
     * @example
     * // 发送到插件自己的主进程
     * sendToMain("self", "functionName", {name:"xxx", age:18}, (err:any, data:any)=>{
     *      // 参数和event.reply对应
     *      if(err) {
     *          return;
     *      }
     *      console.log(data)
     * })
     * // 发送到A插件的主进程
     * sendToMain("pluginA-name", "functionName", "args", ()=>{
     *    
     * })
     * 
     * // 插件主进程main.ts的处理
     * CCP.init(pluginConfig, {
     *  messages: {
     *      // functionName是和sendToMain的第二个参数对应的
     *      functionName (event:any, args:any){
     *          if(event.reply){
     *              // 响应sendToMain的回调
     *              // 第一个参数代表错误值，如果处理成功必须为0，非0值会被electron视为错误捕获住，影响回调的触发
     *              // 第二个参数就是回调函数接收到的参数，这里是将sendToMain的第三个参数又回传给回调了
     *              event.reply(0, args);
     *          }
     *      }
     *  }
     * })
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
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            Editor.Message.send(plugin, functionName, args)
        }
        return false;
    }
    executeSceneScript<T>(func: string, ...args: any): Promise<T> {
        if (this.adaptation.Env.isPluginV3) {
            const { manifest } = this.adaptation.config!;
            const options = {
                name: manifest.name,
                method: func,
                args,
            };
            // @ts-ignore
            const ret: Promise<T> = Editor.Message.request('scene', 'execute-scene-script', options);
            return ret;
        }
        return Promise.reject(new Error('暂未实现'));
    }
}