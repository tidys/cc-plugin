import { existsSync, statSync } from 'fs';
import * as OS from 'os';
import { Base } from './base';
import { dirname, sep } from 'path';
import { execSync } from 'child_process';
const Electron = require('electron');
export class Shell extends Base {
    private _getCmd(path: string): string {
        if (!existsSync(path)) {
            return '';
        }
        if (statSync(path).isFile()) {
            path = dirname(path)
        }
        let cmd = '';
        switch (OS.platform()) {
            case 'win32': {
                cmd = `start "" "${path}"`;
                break;
            }
            case 'darwin': {
                cmd = `open "${path}"`;
                break;
            }
        }
        // require('child_process').exec(cmd);
        return cmd;
    }
    showItem(path: string) {
        if (this.adaptation.Env.isWeb) {
            return;
        }
        if (!existsSync(path)) {
            return;
        }
        // if (statSync(path).isFile()) {
        //     path = dirname(path)
        // }
        path = path.replace(/\//g, sep);
        // if (this.adaptation.Env.isPlugin) {
        //     if (this.adaptation.Env.isWin) {
        //         execSync(`start explorer.exe /select,"${path}"`);
        //         return;
        //     } else {

        //     }
        // }
        if (this.adaptation.Env.isPlugin) {
            // @ts-ignore
            const fn = Electron.remote?.shell?.showItemInFolder
                || Electron.shell?.showItemInFolder
                || null;
            fn && fn(path);
        }
    }
    // TODO: remote的问题：The remote module is deprecated. Use https://github.com/electron/remote instead.
    beep() {
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Electron.remote?.shell?.beep();
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            Electron.remote?.shell?.beep();
        } else if (this.adaptation.Env.isWeb) {

        }
    }

    openUrl(url: string) {
        if (this.adaptation.Env.isWeb) {
            window.open(url);
        } else {
            // @ts-ignore
            Electron.shell.openExternal(url);
        }
    }
}