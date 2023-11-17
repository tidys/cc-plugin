declare global {
    const __VALID_CODE__: boolean;
}
export interface MenuOptions {
    /**
     * 目前只能放到package下边，creator会审核这个菜单路径
     */
    path: string;
    icon?: string;
    accelerator?: string;
    message: {
        panel?: string;
        name: string;
    };
}
export interface PanelOptions {
    main: string;
    /**
     * creator插件面板的名字，是面板的key值，打开面板需要这个key
     * web版本，如果没有title，就会使用该字段
     */
    name: string;
    /**
     * creator插件面板或者网页的标题
     */
    title: string;
    type: string;
    icon?: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    ejs?: string;
    ejsOptions?: Record<string, any>;
}
export declare const Panel: {
    Type: {
        DockAble: string;
        Simple: string;
        InnerIndex: string;
    };
};
export interface CocosPluginManifest {
    name: string;
    main: string;
    version: string;
    description?: string;
    /**
     * 插件的商店链接
     */
    store?: string;
    /**
     * 插件的web站点地址，可以配置多个，比如GitHub/Gitee
     */
    site?: string[];
    author?: string;
    panels?: PanelOptions[];
    menus?: MenuOptions[];
    i18n_zh?: string;
    i18n_en?: string;
}
export declare enum PluginType {
    PluginV2 = 0,
    PluginV3 = 1,
    Web = 2,
    Electron = 3,
    Vscode = 4
}
export interface CocosPluginOptions {
    server?: {
        enabled?: boolean;
        port?: number;
    };
    watchBuild?: boolean;
    /**
     * 配置的不同类型的输出目录，支持相对路径和绝对路径
     * 最终都会汇总到output字段
     */
    outputProject: string | {
        v2?: string;
        v3?: string;
        web?: string;
        vscode?: string;
        electron?: string;
    };
    /**
     * 发布文件的最终输出目录，一般用户不需要设置这个字段，是cc-plugin的私有字段
     *  */
    output?: string;
    /**
     * 插件的zip包的存放位置，支持绝对路径和相对路径，默认相对路径./dist
     */
    zipOutput?: string;
    /**
     * pack模式下是否清理上次的输出目录结果
     */
    cleanBeforeBuildWithPack?: boolean;
    cwd?: string;
    type: PluginType;
    /**
     * package.json是否压缩
     */
    min?: boolean;
    treeShaking?: boolean;
}
export declare const DefaultCocosPluginOptions: CocosPluginOptions;
export interface CocosPluginConfig {
    manifest: CocosPluginManifest;
    options: CocosPluginOptions;
}
export interface CocosPluginV2 {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    "main-menu"?: Record<string, {
        icon?: string;
        message?: string;
        accelerator?: string;
    }>;
    dependencies?: string[];
}
export interface CocosPluginV3 {
    name: string;
    version: string;
    description?: string;
    package_version?: number;
    main: string;
    author?: string;
    contributions?: {
        builder?: string;
        menu?: Array<{
            path: string;
            label: string;
            message: string;
        }>;
        messages?: Record<string, {
            methods?: string[];
        }>;
        shortcuts?: Array<{
            message?: string;
            win?: string;
            mac?: string;
        }>;
    };
    panels?: Record<string, {
        type: string;
        main: string;
        title?: string;
        icon?: string;
        width?: number;
        height?: number;
        "min-width"?: number;
        "min-height"?: number;
    }>;
    dependencies?: string[];
}
export interface PluginMainWrapper {
    load: Function;
    unload?: Function;
    builder?: {
        onAfterBuildAssetsFinish?: Function;
        onAfterBuild?: Function;
        onBeforeBuild?: Function;
    };
    messages?: Record<string, Function>;
}
export interface BuilderOptions {
    buildPath: string;
    outputPath: string;
    platform: string;
    md5Cache: boolean;
}
export declare const Platform: {
    WebMobile: string;
    WebDesktop: string;
    Android: string;
    Ios: string;
    Mac: string;
    Win32: string;
};
