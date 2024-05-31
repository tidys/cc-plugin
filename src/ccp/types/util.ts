import { existsSync, readFileSync } from "fs";
import { join } from "path";

export function parseJsonFile(project: string, file: string): any {
    const fullPath = join(project, file);
    if (!existsSync(fullPath)) {
        return null;
    }
    let data: any = null;
    try {
        data = JSON.parse(readFileSync(fullPath, 'utf-8'))
    } catch (e: any) {
        data = null;
    }
    return data;
}