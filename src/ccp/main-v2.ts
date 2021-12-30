import CCP from './index'
import ClientSocket from './client-socket';

// 这个port需要动态获取
const port = 2346;
const hot = true;

export const load = (() => {
    console.log('load')
    if (hot) {
        let client = new ClientSocket();
        client.setReloadCallback(() => {
            const { name } = CCP.manifest!;
            // @ts-ignore
            const fsPath = Editor.url(`packages://${name}`)
            // @ts-ignore
            Editor.Package.reload(fsPath, () => {
                console.log('reload success')
            });
        })
        client.connect(port)
    }
    CCP.wrapper?.load();
    return 0;
})

export const messages = CCP.wrapper?.messages || {}
