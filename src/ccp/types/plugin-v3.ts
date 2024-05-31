import { existsSync, readFileSync } from "fs"
import { join } from "path"

// ---------------------------- build.json -----------------------------------
export interface Task {
    "type": "build",
    /***
     * 构建的id，和key对应
     */
    "id": string,
    /**
     * 构建的进度，取值范围 [0, 1]
     */
    "progress": number,
    /**
     * 构建的状态
     */
    "state": "success" | "processing",
    "stage": "build",
    /**
     * 构建输出的消息
     */
    "message": string,
    "options": {
        /**
         * 游戏名称
         */
        "name": string,
        /**
         * 构建的平台
         */
        "platform": "android" | "web-mobile" | string,
        /**
         * 构建的基础路径
         */
        "buildPath": "project://build",
        /**
         * 构建输出的相对目录
         * @example android
         */
        "outputName": string,
        /**
         * 调试模式
         */
        "debug": boolean,
        /**
         * md5缓存
         */
        "md5Cache": boolean,
        /**
         * 跳过纹理压缩
         */
        "skipCompressTexture": boolean,
        "sourceMaps": boolean,
        "polyfills": {
            "asyncFunctions": boolean
        },
        "experimentalEraseModules": boolean,
        "useBuiltinServer": boolean,
        /**
         * 配置主包为远程包
         */
        "mainBundleIsRemote": boolean,
        /**
         * 主包压缩类型
         */
        "mainBundleCompressionType": "merge_dep" | "none" | "merge_all_json",
        /**
         * 启用插屏
         */
        "useSplashScreen": boolean,
        "packAutoAtlas": boolean,
        /**
         * 初始场景
         */
        "startScene": string,
        /**
         * 参与构建场景
         */
        "scenes": Array<{
            /**
             * @example "db://assets/scene-001.scene"
             */
            "url": string,
            "uuid": string,
            "inBundle": boolean
        }>,
        "android": [],
        "packages": {},
        "__version__": string
    },
    /**
     * 构建的时间
     * @example 2024-5-30 19:37
     */
    "time": string,
    /**
     * 构建成功为true，否则为false
     */
    "dirty": boolean
}

interface Profile_V2_Packages_Builder_Json {
    "__version__": string,
    log: {
        level: number,
    },
    BuildTaskManager: {
        taskMap: Record<string, Task>
    },
    "common": Common,
}
/**
 * 不应该作为数据支持的基础，数据有点杂乱
 */
interface Common {
    /**
    * 构建输出的基础路径： "project://build"
    */
    "buildPath": string,
    /**
     * 基于基础路径的输出路径， 比如： "project://build/android"
     */
    "outputName": "android" | string,
    "mainBundleCompressionType": "merge_dep",
    "platform": "android",
    /**
     * 初始场景
     */
    "startScene": string,
    /**
     * 配置主包为远程包
     */
    "mainBundleIsRemote": boolean;
    /**
     * 构建项目的名字
     * 没有这个字段时，使用的是package.json里面的name
     */
    name?: string;
}
// ---------------------------- android.json ---------------------------------------------
interface AndroidOptions {
    /**
    * Android包名
    */
    "packageName": string,
    /**
     * 设备方向
     */
    "orientation": {
        /**
         * 竖屏
         */
        "portrait": boolean,
        /**
         * 竖屏
         */
        "upsideDown": boolean,
        /**
         * 右横屏
         */
        "landscapeRight": boolean,
        /**
         * 左横屏
         */
        "landscapeLeft": boolean
    },
    "apiLevel": number,
    "appABIs": Array<"armeabi-v7a" | "arm64-v8a" | "x86" | "x86_64">,
    /**
     * 使用调试密钥库
     */
    "useDebugKeystore": boolean,
    /**
     * 密钥库路径
     */
    "keystorePath": string,
    /**
     * 密钥库密码
     */
    "keystorePassword": string,
    /**
     * 密钥库别名
     */
    "keystoreAlias": string,
    /**
     * 密钥库别名密码
     */
    "keystoreAliasPassword": string,
    /**
     * Google App Bundle
     */
    "appBundle": boolean,
    /**
     * Google Play Instant 
     */
    "androidInstant": boolean,
    /**
     * 资源服务器地址
     */
    "remoteUrl": string,
    "sdkPath": string,
    "ndkPath": string,
    /**
     * 渲染后端
     */
    "renderBackEnd": {
        "vulkan": boolean,
        "gles3": boolean,
        "gles2": boolean
    },
    /**
     * 启用swappy
     */
    "swappy": boolean,
    "__version__": string
}
interface Profile_V2_Packages_Android_Json {
    "__version__": string,
    "builder": {
        "common": Common,
        "options": {
            "android": AndroidOptions
        },
        "taskOptionsMap": Record<string, AndroidOptions>,
        "__version__": string
    }
}

// ------------------------------ native.json -----------------------------------------------

interface Native_Task_Map {
    /**
    * 是否加密脚本
    */
    "encrypted": boolean,
    /**
     * 加密密钥
     */
    "xxteaKey": "fe4a/tcKlKob7tdJ",
    /**
     * 是否使用zip压缩脚本
     */
    "compressZip": boolean,
    /**
     * 任务调度系统
     */
    "JobSystem": "none" | "tbb" | "taskFlow",
    "__version__": string
}
interface Profile_V2_Packages_Native_Json {
    "__version__": string,
    "builder": {
        "taskOptionsMap": Record<string, Native_Task_Map>,
        "__version__": string
    },
    "options": {
        "android": Native_Task_Map,
    }
}
import { parseJsonFile } from './util'
export function getV3NativeJson(project: string): Profile_V2_Packages_Native_Json | null {
    return parseJsonFile(project, 'profiles/v2/packages/native.json');
}
export function getV3BuilderJson(project: string): Profile_V2_Packages_Builder_Json | null {
    return parseJsonFile(project, 'profiles/v2/packages/builder.json');
}
export function getNativeItem(project: string, id: string): Native_Task_Map | null {
    const data = getV3NativeJson(project)
    if (!data) {
        return null;
    }
    const item = data.builder.taskOptionsMap[id];
    if (!item) {
        return null;
    }
    return item;
}
export function getAndroidTaskMap(project: string, id: string): AndroidOptions | null {
    const data = getV3AndroidJson(project);
    if (!data) {
        return null;
    }
    const item = data.builder.taskOptionsMap[id];
    if (!item) {
        return null;
    }
    return item;
}
export function getV3AndroidJson(project: string): Profile_V2_Packages_Android_Json | null {
    return parseJsonFile(project, "profiles/v2/packages/android.json")
}

