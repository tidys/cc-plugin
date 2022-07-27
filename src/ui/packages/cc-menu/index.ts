import menu from './menu.vue';
import {Emitter} from '../index';

export class IUiMenuItem {
    name = '';
    enabled? = true;
    callback: Function | null = null;

    constructor(name: string, callback:Function|null = null, enabled = true) {
        this.name = name;
        this.callback = callback;
        this.enabled = enabled;
    }
}

export const Msg = {
    ShowMenu: 'show-menu',
};

export interface MenuOptions {
    x: number;
    y: number;
}

export function showMenuByMouseEvent(event: MouseEvent, newMenus: IUiMenuItem[]): void {
    const options: MenuOptions = {
        x: event.clientX + 2,
        y: Math.abs(event.clientY),
    };
    Emitter.emit(Msg.ShowMenu, options, newMenus || []);
}

