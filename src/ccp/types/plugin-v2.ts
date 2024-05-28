export interface Settings_Builder_Json {
    /**
     * 游戏名称，android不能是中文，会影响构建
     */
    "title": string,
    /**
     * 包名: android
     */
    "packageName": string,
    /**
     * 初始场景
     */
    "startScene": string,
    /**
     * 未参与构建的场景
     */
    "excludeScenes": string[],
    /**
     * 设备方向
     */
    "orientation": {
        "landscapeRight": boolean,
        "landscapeLeft": boolean,
        "portrait": boolean,
        "upsideDown": boolean
    },
    /**
     * web平台的设备方向
     */
    "webOrientation": "portrait" | "landscape" | "auto",


    /**
     * 主包压缩类型，zip类型为小游戏的
     */
    "mainCompressionType": "merge_all_json" | "none" | "default" | "zip",
    /**
     * 内联所有SpriteFrame
     * 当主包压缩类型为default时，此配置项有效，此项是针对web、小游戏平台的
     */
    "inlineSpriteFrames": boolean,
    /**
     * 内联所有SpriteFrame
     * 当主包压缩类型为default时，此配置项有效，此项是针对 Native（win/android/ios）平台的
     */
    "inlineSpriteFrames_native": boolean,

    /**
     * 配置主包为远程包
     * 此项是针对小游戏平台的
     */
    "mainIsRemote": boolean,
    /**
     * 合并图集中的SpriteFrame
     * 是否将图集中的全部 SpriteFrame 合并到同一个包中
     */
    "optimizeHotUpdate": boolean,
    /**
     * MD5 Cache (非Native平台)
     */
    "md5Cache": boolean,
    /**
     * MD5 Cache (Native平台)
     */
    "nativeMd5Cache": boolean,
    /**
     * 加密脚本
     */
    "encryptJs": boolean,
    /**
     * 加密脚本的密钥
     */
    "xxteaKey": string,
    /**
     * 加密脚本后使用zip压缩
     */
    "zipCompressJs": boolean,
    /**
     * FaceBook Instant Games的配置
     */
    "fb-instant-games": {},
    /**
     * Android的配置
     */
    "android": {
        /**
         * 安卓的包名
         */
        "packageName": string,
        /**
         * 资源服务器地址
         */
        "REMOTE_SERVER_ROOT": string
    },
    /**
     * ios的配置
     */
    "ios": {
        /**
         * 包名
         */
        "packageName": string,
        /**
         * 资源服务器地址
         */
        "REMOTE_SERVER_ROOT": string,
        /**
         * 是否开启jit编译
         */
        "ios_enable_jit": boolean
    },

    /**
     * mac的配置
     */
    "mac": {
        /**
         * 包名
         */
        "packageName": string,
        /**
         * 资源服务器地址
         */
        "REMOTE_SERVER_ROOT": string,
        /**
         * 窗口宽度
         */
        "width": number,
        /**
         * 窗口高度
         */
        "height": number
    },
    "win32": {
        /**
         * 资源服务器地址
         */
        "REMOTE_SERVER_ROOT": string,
        /**
         * 窗口宽度
         */
        "width": number,
        /**
         * 窗口高度
         */
        "height": number
    },
    "android-instant": {
        /**
         * 包名
         */
        "packageName": string,
        /**
         * 资源服务器地址
         */
        "REMOTE_SERVER_ROOT": string,
        /**
         * 启动URL
         */
        "pathPattern": string,
        "scheme": "https" | string,
        "host": string,
        "skipRecord": boolean,
        /**
         * 分包配置路径
         */
        "recordPath": string
    },
    /**
     * 生成AppBundle(Google Play)
     */
    "appBundle": boolean,
    /**
     * 集成Cocos Analytics
     */
    "agreements": {
        /**
         * Cocos隐私政策
         */
        "20200904180755"?: boolean,
        /**
         * Cocos用户服务协议
         */
        "20220901093235"?: boolean

    },
    "includeAnySDK": boolean,
    "autoCompile": boolean,
    "includeSDKBox": boolean
}
export interface Local_Builder_Json {
    /**
     * 上次构建的平台
     */
    "platform": "android" | "web-mobile" | "web-desktop" | "win32" | "mini-game" | string,
    /**
     * 构建的真实平台
     * 只有当platform为mini-game时，会出现platform与actualPlatform不一致的情况
     */
    "actualPlatform": "wechatgame" | string,
    /**
     * 构建模版
     */
    "template": "link" | "default",
    /**
     * 构建的目录
     */
    "buildPath": string,
    /**
     * 调试模式
     */
    "debug": boolean,
    "sourceMaps": boolean,
    /**
     * vConsole
     */
    "embedWebDebugger": boolean,
    /**
     * 预览分辨率的宽度，当为web-desktop时，该值有效
     */
    "previewWidth": string,
    /**
     * 预览分辨率的高度，当为web-desktop时，该值有效
     */
    "previewHeight": string,
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
     * Android Target API Level
     */
    "apiLevel": string,
    "appABIs": Array<"armeabi-v7a" | "arm64-v8a" | "x86" | "x86_64">,
    /**
     * vs版本
     */
    "vsVersion": string,
    /**
     * 只构建脚本
     */
    "buildScriptsOnly": boolean
}