import { IUiMenuItem } from '@xuyanfeng/cc-ui/types/cc-menu';
import { Base } from './base';
const Electron = require('electron');

export class Menu extends Base {
    popup(event: MouseEvent, menus: IUiMenuItem[]) {
        menus = menus.map((menu) => {
            return {
                name: menu.name,
                callback: menu.callback || null,
                enabled: menu.enabled,
            };
        });
        if (this.adaptation.Env.isWeb) {
            // TODO: fix version
            // Methods.CCMenu.showMenuByMouseEvent(event, menus);
        } else {
            const { Menu, MenuItem, getCurrentWindow } = Electron.remote;
            let menu = new Menu();
            for (let i = 0; i < menus.length; i++) {
                let item = menus[i];
                menu.append(new MenuItem({ label: item.name, click: item.callback }));
            }
            menu.popup(getCurrentWindow());
        }
    }
}
