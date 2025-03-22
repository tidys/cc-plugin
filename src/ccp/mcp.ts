import WebSocket from "ws";
import CCP from './entry-main'
import { PluginMcpTool } from "../declare";
enum CMD {
    Test = "test",
    ListTools = "list-tools",
    CmdRun = "cmd-run",
}

export class Mcp {
    private port: number = 5395;
    private host: string = "127.0.0.1";
    private socket: WebSocket | null = null;

    private cmds: Record<string, (args: any) => Promise<string | null>> = {};
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            console.log("mcp socket disconnect");
        }
    }
    connect() {
        this.disconnect();
        this.getListTools().forEach((tool: PluginMcpTool) => {
            this.cmds[tool.name] = tool.callback;
        });
        this.socket = new WebSocket(`ws://${this.host}:${this.port}`);
        this.socket.onopen = () => {
            // 当和cocos-mcp连接上之后，就告诉cocos-mcp，我有哪些工具可以用
            const tools = this.getListTools();
            this.send(CMD.ListTools, tools);
        };
        this.socket.onmessage = (e) => {
            (async () => {
                const ret = JSON.parse(e.data.toString());
                const { cmd, data } = ret;
                if (CMD.CmdRun === cmd) {
                    const { tool, args } = data;
                    const cb = this.cmds[tool];
                    let text: string | null = "error";
                    if (cb) {
                        text = await cb(args);
                        this.send(cmd, text);
                    }
                }
            })();
        };
    }
    public getListTools(): any[] {
        const tools = CCP.wrapper?.mcp || [];
        // 只有设置为false时，才无效
        return tools.filter(el => !(el.valid === false));
    }
    test(data: any) {
        this.send(CMD.Test, data);
    }
    send(cmd: string, data: any) {
        if (this.socket) {
            const str = JSON.stringify({ cmd, data });
            this.socket.send(str);
        }
    }
}

export const mcp = new Mcp();
