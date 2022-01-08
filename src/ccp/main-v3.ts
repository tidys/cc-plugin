import CCP from './entry-main'
import ClientSocket from './client-socket';

// 这个port需要动态获取
const port = 2346;
const hot = true;

export function load() {
    console.log('load');
    if (hot) {

    }
    CCP.wrapper?.load();
}

export function unload() {
    console.log('unload')
}

export const methods = CCP.wrapper?.messages || {}
