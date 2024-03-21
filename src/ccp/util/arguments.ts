import { parse } from "url";
import * as querystring from "querystring";
class PluginArguments {
    public constructor() { }
    getArgument(key: string): string | string[] | null {
        const data = parse(window.location.href);
        if (data.query) {
            const args = querystring.parse(data.query);
            return args[key] || null;
        }
        return null;
    }
    hasArgument(key: string): boolean {
        const data = parse(window.location.href);
        if (data.query) {
            const args = querystring.parse(data.query);
            return args[key] !== undefined;
        }
        return false;
    }
}
export const pluginArguments = new PluginArguments();
