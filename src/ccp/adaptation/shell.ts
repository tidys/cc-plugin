import * as Fs from 'fs';
import * as OS from 'os';
import { Base } from './base';
const Path = require('path');
const Electron = require('electron');
export class Shell extends Base {
    private _getCmd(path: string): string {
        if (!Fs.existsSync(path)) {
            return '';
        }
        if (Fs.statSync(path).isFile()) {
            path = Path.dirname(path)
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
        if (this.adaptation.Env.isPluginV2) {
            // @ts-ignore
            Electron.remote?.shell?.showItemInFolder(path);
        } else if (this.adaptation.Env.isPluginV3) {
            // @ts-ignore
            Electron.remote?.shell?.showItemInFolder(path);
        } else if (this.adaptation.Env.isWeb) {
        }
    }

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