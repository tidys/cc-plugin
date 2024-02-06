import CCP from './entry-main'
import ClientSocket from './client-socket';
import { BuilderOptions } from '../declare';
import * as Path from 'path';
const EventBeforeChangeFiles = 'before-change-files'

function onBeforeBuildFinish(options, callback) {
    callback && callback()
}
export const load = (() => {
    if (CCP.options && CCP.options.server) {
        // 发布后的不再进行watch
        const { enabled, port } = CCP.options.server;
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
    }

    CCP.wrapper?.load();
    // 'build-start'：构建开始时触发。
    // 'before-change-files'：在构建结束 之前 触发，此时除了计算文件 MD5、生成 settings.js、原生平台的加密脚本以外，大部分构建操作都已执行完毕。我们通常会在这个事件中对已经构建好的文件做进一步处理。
    // 'build-finished'：构建完全结束时触发。
    // @ts-ignore
    Editor.Builder.on(EventBeforeChangeFiles, onBeforeBuildFinish);
    return 0;
})
export const unload = (() => {
    // @ts-ignore
    Editor.Builder.on(EventBeforeChangeFiles, onBeforeBuildFinish);
});
// 供参考的数据格式
// 从 v2.4 开始，options 中不再提供 buildResults，而是提供了一个 bundles 数组。
// https://docs.cocos.com/creator/2.4/manual/zh/publish/custom-project-build-template.html#%E8%8E%B7%E5%8F%96%E6%9E%84%E5%BB%BA%E7%BB%93%E6%9E%9C
const testOptions = {
    "title": "hot-update",
    "packageName": "org.cocos2d.demo",
    "startScene": "4cbddec6-2459-433e-b20f-54dc05b7683d",
    "excludeScenes": [],
    "orientation": {
        "landscapeRight": true,
        "landscapeLeft": true,
        "portrait": false,
        "upsideDown": false
    },
    "webOrientation": "auto",
    "inlineSpriteFrames": true,
    "inlineSpriteFrames_native": true,
    "mainCompressionType": "default",
    "mainIsRemote": false,
    "optimizeHotUpdate": false,
    "md5Cache": false,
    "nativeMd5Cache": true,
    "encryptJs": true,
    "xxteaKey": "13ed8a78-b239-4e",
    "zipCompressJs": true,
    "fb-instant-games": {},
    "android": {
        "packageName": "org.cocos2d.demo",
        "REMOTE_SERVER_ROOT": ""
    },
    "ios": {
        "packageName": "org.cocos2d.demo",
        "REMOTE_SERVER_ROOT": "",
        "ios_enable_jit": true
    },
    "mac": {
        "packageName": "org.cocos2d.demo",
        "REMOTE_SERVER_ROOT": "",
        "width": 1280,
        "height": 720
    },
    "win32": {
        "REMOTE_SERVER_ROOT": "",
        "width": 1280,
        "height": 720
    },
    "android-instant": {
        "packageName": "org.cocos2d.demo",
        "REMOTE_SERVER_ROOT": "",
        "pathPattern": "",
        "scheme": "https",
        "host": "",
        "skipRecord": false,
        "recordPath": ""
    },
    "appBundle": false,
    "agreements": {

    },
    "platform": "web-mobile",
    "actualPlatform": "web-mobile",
    "template": "link",
    "buildPath": "E:\\\\proj\\\\creator\\\\hot-update-2x\\\\build",
    "debug": true,
    "sourceMaps": true,
    "embedWebDebugger": false,
    "previewWidth": "1280",
    "previewHeight": "720",
    "useDebugKeystore": true,
    "apiLevel": "android-33",
    "appABIs": [],
    "vsVersion": "auto",
    "buildScriptsOnly": false,
    "dest": "E:\\\\proj\\\\creator\\\\hot-update-2x\\\\build\\\\web-mobile",
    "separateEngineMode": false,
    "scenes": ["4cbddec6-2459-433e-b20f-54dc05b7683d"],
    "excludedModules": ["3D Physics/Builtin"]
}
// 接管一下builder
export const messages = Object.assign(CCP.wrapper?.messages || {}, {
    'builder:state-changed'(event: any, options: any) {

    },
    'editor:build-start'(event: any, options: any) {
        const { platform, md5Cache, dest } = options;
        const param: BuilderOptions = {
            platform,
            md5Cache,
            outputPath: dest,
            buildPath: Path.dirname(dest),
        }
        if (CCP && CCP.wrapper && CCP.wrapper.builder && CCP.wrapper.builder.onBeforeBuild) {
            CCP.wrapper.builder.onBeforeBuild(param);
        }
    },
    // TODO: 从1.9开始，不建议使用了，命令行构建不会触发这个事件，推荐使用Editor.Builder
    'editor:build-finished'(event: any, options: any) {
        const { platform, md5Cache, dest } = options;
        const param: BuilderOptions = {
            platform,
            md5Cache,
            outputPath: dest,
            buildPath: Path.dirname(dest),
        }
        if (CCP && CCP.wrapper && CCP.wrapper.builder && CCP.wrapper.builder.onAfterBuild) {
            CCP.wrapper.builder.onAfterBuild(param);
        }
    }
})
