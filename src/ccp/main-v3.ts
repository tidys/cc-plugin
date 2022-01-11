import CCP from './entry-main'
import ClientSocket from './client-socket';
import { BuilderOptions } from '../declare';
import * as Path from 'path';

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

export const methods = Object.assign(
    CCP.wrapper?.messages || {},
    {
        // 接收来自builder的消息，wrapper中不能含有这个key
        onBuilder(options: any) {
            const { buildPath, name, outputName, platform, md5Cache } = options;
            debugger
            const buildFsPath = CCP.Adaptation.Util.urlToFspath(buildPath);
            const param: BuilderOptions = {
                buildPath: buildFsPath,
                outputPath: Path.join(buildFsPath, outputName),
                platform,
                md5Cache,
            }
            CCP.wrapper?.builder?.onAfterBuild(param);
        }
    }
)
