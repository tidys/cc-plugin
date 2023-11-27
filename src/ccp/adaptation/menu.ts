import { Base } from './base';
const Electron = require('electron');
// 要和cc-ui保持一致
interface IUiMenuItem {
    name: string;
    enabled?: true;
    callback: Function | null;
}
export class Menu extends Base {
    /**
     * web平台需要自己实现，可以使用 ccui.menu.showMenuByMouseEvent(event, menus); 
     * 插件使用的是electron底层接口
     */
    popup(event: MouseEvent, menus: IUiMenuItem[], cb: { web?: (event: MouseEvent, menus: IUiMenuItem[]) => void }) {
        menus = menus.map((menu) => {
            return {
                name: menu.name,
                callback: menu.callback || null,
                enabled: menu.enabled,
            };
        });
        if (this.adaptation.Env.isWeb) {
            const { web } = cb;
            web && web(event, menus);
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
