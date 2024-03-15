declare global {
    const __VALID_CODE__: boolean;
    const __PLUGIN_TYPE__: string;
}
export interface MenuOptions {
    /**
     * 目前只能放到package下边，creator会审核这个菜单路径
     * 如果是以i18n.开头，会自动进行i18n相关的展开
     * 比如在2.x插件中，i18n.title会展开为 EditorMenu/i18n:PackageName.title
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
    /**
     * 发现creator v3.6.1、v3.7.3等3.x版本中，因为面板的dock-layout容器组件设置的ccs min-width、min-height属性就是该值
     * 当缩小面板后，发现ui面板被截断，当ui面板再次激活后，会重新调整ui面板的size，就正常了，这个是creator的bug
     */
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
        Web: string;
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
    /**
     * 插件的icon相对路径，暂时只有chrome用到了
     * chrome默认使用48x48的png格式，其他尺寸我暂时没有用到
     */
    icon?: string | {
        '48': string;
    };
    /**
     * chrome插件
     */
    chrome?: {
        /**
         * chrome插件的版本
         */
        version: 2 | 3;
        /**
         * chrome打包crx的pem
         */
        pem?: string;
        /**
         * 弹出界面
         */
        view_popup: string;
        /**
         * 设置界面
         */
        view_options: string;
        /**
         * devtools界面
         */
        view_devtools: string;
        script_content: string;
        script_inject: string;
        script_background: string;
    };
}
export declare enum PluginType {
    PluginV2 = "cp-v2",
    PluginV3 = "cp-v3",
    Web = "web",
    Chrome = "chrome"
}
export interface CocosPluginOptions {
    server?: {
        enabled?: boolean;
        /**
         * 监听端口，需要优化判断下端口是否占用的问题
         */
        port?: number;
        /**
         * 使用https协议,默认http协议
         */
        https?: boolean;
        /**
         * 构建结果是否写入磁盘，默认不写入磁盘，会存储在内存中
         */
        writeToDisk?: boolean;
    };
    watchBuild?: boolean;
    /**
     * 配置的不同类型的输出目录，支持相对路径和绝对路径
     * 最终都会汇总到output字段
     */
    outputProject: string | {
        v2?: string;
        v3?: string;
        /**
         * 目前仅支持相对路径
         */
        web?: string;
        vscode?: string;
        electron?: string;
        /**
         * 同时支持相对路径和绝对路径
         */
        chrome?: string;
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
    'main-menu'?: Record<string, {
        icon?: string;
        message?: string;
        accelerator?: string;
    }>;
    dependencies?: string[];
}
export interface PanelOptionsV3 {
    /**
     * 面板标题
     */
    title: string;
    /**
     * 标记
     */
    flags?: {
        /**
         * 默认为true
         */
        resizable?: boolean;
        /**
         * 是否需要保存
         */
        save?: boolean;
        /**
         * 是否保持顶层显示，默认为false
         */
        alwaysOnTop: boolean;
    };
    /**
     * 面板类型
     */
    type?: string | 'dockable' | 'simple';
    /**
     * 面板源码目录
     */
    main: string;
    /**
     * 面板图标的相对目录
     */
    icon?: string;
    /**
     * 面板尺寸
     */
    size?: {
        /**
         * 最小宽度
         */
        'min-width'?: number;
        /**
         * 最小高度
         */
        'min-height'?: number;
        /**
         * 默认宽度
         */
        width?: number;
        /**
         * 默认高度
         */
        height?: number;
    };
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
    panels?: Record<string, PanelOptionsV3>;
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
