import CCP from "cc-plugin/src/ccp/entry-main";
import { PluginMcpTool } from "cc-plugin/src/declare";

export const mcpTools: PluginMcpTool[] = [
    {
        name: "sum",
        valid: false, // 参考模版接口，默认不生效
        description: "the sum of two numbers",
        inputSchema: {
            type: "object",
            properties: {
                number1: {
                    type: "string",
                    description: "number1",
                },
                number2: {
                    type: "string",
                    description: "number1",
                },
            },
            required: ["state"],
        },
        callback: async (args: any) => {
            const { number1, number2 } = args;
            return `${number1}+${number2}=${Number(number1) + Number(number2)}!`;
        },
    },
];
