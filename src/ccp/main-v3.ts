import CCP from './entry-main'
import ClientSocket from './client-socket';
import { BuilderOptions } from '../declare';
import * as Path from 'path';

export function load() {
    const { enabled, port } = CCP.options?.server!;
    if (!!enabled) {
        const client = new ClientSocket();
        client.setReloadCallback(() => {
            throw new Error('没有实现')
        });
        client.connect(port!);
    }
    CCP.wrapper?.load();
}

export function unload() {
    console.log('unload')
}

export const methods = Object.assign(
    CCP.wrapper?.messages || {},
    {
        // 接收来自builder的消息，wrapper中不能含有这个key
        onBuilder(options: any) {
            const { type, data } = options;
            const { buildPath, name, outputName, platform, md5Cache } = data;
            const buildFsPath = CCP.Adaptation.Util.urlToFspath(buildPath);
            const param: BuilderOptions = {
                buildPath: buildFsPath,
                outputPath: Path.join(buildFsPath, outputName),
                platform,
                md5Cache,
            }

            if (type === 'onAfterBuild') {
                CCP.wrapper?.builder?.onAfterBuild(param);
            }
        }
    }
)
