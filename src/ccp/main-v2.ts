import CCP from './entry-main'
import ClientSocket from './client-socket';
import { BuilderOptions } from '../declare';
import * as Path from 'path';

export const load = (() => {
    // 发布后的不再进行watch
    const { enabled, port } = CCP.options?.server!;
    if (!!enabled) {
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
        client.connect(port!)
    }
    CCP.wrapper?.load();
    return 0;
})


// 接管一下builder
export const messages = Object.assign(CCP.wrapper?.messages || {}, {
    'editor:build-finished'(event: any, options: any) {
        const { platform, md5Cache, dest } = options;
        const param: BuilderOptions = {
            platform,
            md5Cache,
            outputPath: dest,
            buildPath: Path.dirname(dest),
        }
        CCP.wrapper?.builder?.onAfterBuild(param);
    }
})
