declare global {
    const __VALID_CODE__: boolean;
    const __PLUGIN_TYPE__: string;
    /**
     * 是否在开发模式下，也就是ccp serve xxx的运行环境
     */
    const __DEV__: boolean;
    /**
     * 开发模式下的工作目录，也就是cc-plugin.config.ts所在的目录
     */
    const __DEV_WORKSPACE__: string;
    const __PANEL__: PanelOptions;
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
        panel?: string; // 发送给哪个面板
        name: string; // 消息名字
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
    /**
     * 是否为无边框窗口，当type为Floating时才有效
     */
    board?: boolean;
    icon?: string;
    width?: number;
    height?: number;
    /**
     * 发现creator v3.6.1、v3.7.3等3.x版本中，因为面板的dock-layout容器组件设置的ccs min-width、min-height属性就是该值
     * 当缩小面板后，发现ui面板被截断，当ui面板再次激活后，会重新调整ui面板的size，就正常了，这个是creator的bug
     */
    minWidth?: number;
    minHeight?: number;
    /**
     * 自定义面板模板，针对索引面板设计的参数
     */
    ejs?: string;
    /**
     * 自定义面板模板参数
     */
    ejsOptions?: Record<string, any>;
}

export const Panel = {
    Type: {
        /**
         * Creator支持的面板类型
         */
        DockAble: 'dockable',
        /**
         * Creator支持的面板类型
         */
        Simple: 'simple',
        /**
         * 自己实现的，基于electron.BrowserWindow的独立窗口
         * 
         * 注意，不能在该面板中调用编辑器的相关API，只能通过ipcRenderer发送到主进程后，由主进程调用编辑器的接口
         */
        Floating: 'floating',
        /**
         * web页面的索引面板
         */
        InnerIndex: 'inner-index',
        Web: 'web',
    },
};

export interface CocosPluginManifest {
    name: string;
    /**
     * creator插件的主进程入口
     * 
     * web类型没有使用该参数
     */
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
    /**
     * 插件的菜单
     */
    menus?: MenuOptions[];
    /**插件的主进程消息，v3版本要求必须手动声明 */
    messages?: string[];
    i18n_zh?: string;
    i18n_en?: string;
    /**
     * 插件的icon相对路径，暂时只有chrome用到了
     * chrome默认使用48x48的png格式，其他尺寸我暂时没有用到
     */
    icon?: string | { '48': string };
    web?: {
        /**
        * 插入到head的标签，比如引入css、js等
        * 
        * 一些统计功能，需要引入js，并放入到head标签中
        *  - 统计鸟：   https://www.tongjiniao.com
        *  - 百度统计： https://tongji.baidu.com
        *      - 对域名备案有要求，部署到 github pages 可能无法被统计
        *  - 360分析：  https://fenxi.360.cn
        *  - 微软：     https://clarity.microsoft.com
        * @example
        * <script type="text/javascript" src="//api.tongjiniao.com/c?_=123456" async></script>
        * <meta charset="utf-8"/>
        */
        head?: string[];
    },
    /**
     * 注册资源数据库，资源数据库的名字为插件的名字
     * 
     * 在creator v3中调用示例 db://test-package/foo
     */
    asset_db_v3?: AssetDB,
    /**
     * 注册资源数据库，资源数据库的名字为: [插件的名字]-code
     * 
     * 在creator v2中调用
     * 
     */
    asset_db_v2?: AssetDB,
    /** 增强资源管理面板，只支持 creator v3.x 版本
     * @example 指向的ts代码如下
     * ```ts
     *  import { AssetInfo, MenuItem } from "cc-plugin/src/declare";
        export function createMenu(assetInfo: AssetInfo): MenuItem[] {
            return [];
        }
        export function assetMenu(assetInfo: AssetInfo): MenuItem[] {
            return [];
        }
        export function dbMenu(assetInfo: AssetInfo): MenuItem[] {
            return [];
        }
        export function panelMenu(assetInfo: AssetInfo): MenuItem[] {
            return [];
        }
     * ```
     * 
     * 
    */
    assets?: string;
    /**
     * 场景脚本
     */
    scene?: string;
    /**
     * creator v3 的hooks脚本，如果用户配置了，就使用用户的脚本，否则使用内置的
     * 
     * https://docs.cocos.com/creator/3.2/manual/zh/editor/publish/custom-build-plugin.html#%E6%9E%84%E5%BB%BA%E8%BF%9B%E7%A8%8B-hooks-%E8%84%9A%E6%9C%AC
     */
    hooks?: string;
    /**
     * creator v3 的builder脚本，如果用户配置了，就使用用户的脚本，否则使用内置的
     */
    builder?: string;
    /**
     * 统计服务
     */
    analysis?: {
        /**
         *  统计鸟的appid
         * 
         * 统计鸟是根据域名进行统计的，不支持子目录，如果你使用的是github pages，一个appid就能满足需求
         * 
         * web.head有重叠，如果配置了该项，请不要在web.head中配置标签
         */
        tongjiniao?: string;
        /**
         * 谷歌统计服务
         */
        googleAnalytics?: {
            /**
             * id可以在手动添加里面找到，一般来说代码不会发生变化，区别只有ID不同
             * 
             * 这个ID会出现在html的head标签里面，不填写就不会在head里面注入统计代码
             */
            measurementID: string;
            /**
             * 需要自己创建密钥，用来发送自定义的统计数据，注意：该项配置依赖measurementID
             * 
             * 只有配置了该项，在调用CCP.GoogleAnalytics.fire()事件才会真正的发送出去
             */
            apiSecret?: string;
        };
        /**
         * 使用Google的Measurement Protocol的统计服务
         */
    },
    /**
     * chrome插件
     */
    chrome?: {
        /**
         * 插件的权限
         */
        permissions?: string[];
        /**
         * 插件的商店地址
         */
        url?: string;
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
        view_popup?: string;
        /**
         * 设置界面
         */
        view_options?: string;
        /**
         * devtools界面
         */
        view_devtools?: string;
        script_content?: string;
        /**
         * 注入到网页的脚本
         */
        script_inject?: string;
        /**
         * 注入到网页的界面，实际发布chrome插件时不会关注这个字段，仅仅是为了方便在web上测试使用vue编写的界面
         */
        script_inject_view?: string;
        /**
         * 插件的后台脚本
         */
        script_background?: string;
    }
}
export interface AssetDB {
    /**
    * 资源数据库相对插件根目录的地址
    */
    path: string;
    /**
     * 是否只读，默认为true
     */
    readonly?: boolean;
}
export enum PluginType {
    PluginV2 = 'cp-v2', // cocos creator 插件v2版本
    PluginV3 = 'cp-v3', // cocos creator 插件v3版本
    Web = 'web', // web页面
    Chrome = 'chrome', // chrome插件
    Electron = "electron", // 桌面应用
    // Vscode="vscode", // vscode插件
}

export interface CocosPluginOptions {
    // hmr server
    server?: {
        enabled?: boolean;
        /**
         * 是否启用creator的hmr，默认不开启，现在开启刷新遇到很多问题
         */
        creatorHMR?: boolean;
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
    /**
     * webpack的监听模式，一般都需要开启
     */
    watchBuild?: boolean; // 监听构建
    /**
     * 配置的不同类型的输出目录，支持相对路径和绝对路径
     * 
     * 不要追加packages/extensions目录，直接填写creator的项目路径，cc-plugin会对项目路径进行校验。
     * 
     * cc-plugin.json中配置可以覆盖此选项，方便多人协作，一般来说不需要将cc-plugin.json纳入版本控制
     * 
     * ```
     * {
     *   "v2": "D://project2x/",
     *   "v3": "D://project3x/"
     * }
     * ```
     */
    outputProject:
    | string
    | {
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
    }; // 输出的项目路径
    /**
     * 发布文件的最终输出目录，一般用户不需要设置这个字段，是cc-plugin的私有字段
     *  */
    output?: string;
    /**
     * 插件的zip包的存放位置，支持绝对路径和相对路径，默认相对路径./dist
     */
    zipOutput?: string;
    /**
     * pack打包模式下是否清理上次的输出目录结果
     */
    cleanBeforeBuildWithPack?: boolean;
    cwd?: string;
    /**
     * package.json是否压缩
     */
    min?: boolean;
    /**
     * 开发模式下是否生成sourcemap，默认生成
     */
    sourcemap?: string;
    treeShaking?: boolean;
    /**
     * 是否混淆代码，默认混淆
     * 
     * server环境不生效，只针对pack环境
     */
    obscure?: boolean;
    /**
     * 静态文件目录，支持绝对路径和相对路径（相对于cc-plugin.config.ts所在目录）
     * 
     * 可以把插件依赖的静态文件放在该目录下，在发布插件时，会将该目录随着插件一起发布
     * 
     * 调试时为了避免大量的重复复制文件，该目录下的文件并不会同步到插件所在的目录下
     * 
     * 要获取该目录下的文件，请统一使用接口：
     * 
     * ```ts
     *  CCP.Adaptation.AssetDB.getStaticFile("1.exe")
     * ```
     */
    staticFileDirectory?: string;
    /**
     * 过滤掉静态文件目录下的哪些文件，支持正则表达式
     * 
     * 比如static中的某个文件夹是使用git管理，插件在使用的过程中会从远程仓库下载，但是插件发布时不需要将该文件夹一起发布。
     * 
     * @example
     *  a/b/* 表示a/b目录下的所有文件会被过滤掉
     * 
     */
    staticFileFilter?: string[];
    /**
     * 当对static资源发起xhr请求时
     * 
     * 在开发阶段webpack dev server 会拦截重定向
     * 
     * 打包后，会将static资源复制到插件根目录
     */
    staticRequestRedirect?: boolean;
}

// 一些默认值
export const DefaultCocosPluginOptions: CocosPluginOptions = {
    outputProject: './',
    output: './dist',
    server: {
        enabled: false,
        port: 2022,
    },
    watchBuild: false,
    min: false,
};

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
    'main-menu'?: Record<string, { icon?: string; message?: string; accelerator?: string }>;
    dependencies?: string[];
    "runtime-resource"?: {
        path: string;
        name: string;
    },
    reload?: {
        ignore?: string[];
    }
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
/**自定义资源管理器菜单的资源数据 */
export interface AssetInfo {
    /**资源用于显示的名字 */
    displayName: string;
    /** 可选，继承类*/
    extends: string[];
    /**导入器名字 */
    importer: string
    /**是否是文件夹 */
    isDirectory: boolean
    /**是否导入完成 */
    imported: boolean
    /** 是否导入失败 */
    invalid: boolean
    /** 资源名字 */
    name: string
    /** 资源文件所在的磁盘绝对路径 */
    file: string
    /** 是否只读 */
    readonly: boolean
    /**资源类型 */
    type: string
    /** db:// 开头的资源地址 */
    url: string
    /**资源 ID */
    uuid: string
}

/**返回的菜单数据
 * 详细参考： https://www.electronjs.org/docs/latest/api/menu-item
 */
export interface MenuItem {
    /**菜单类型*/
    type?: "normal" | "separator" | "submenu" | "checkbox" | "radio"
    /** 显示的文本 */
    label?: string
    /** 显示的二级文本 */
    sublabel?: string
    /** 子项菜单 */
    submenu?: MenuItem[]
    /**点击事件 */
    click: Function
    /**是否可用，不可用会有置灰样式 */
    enabled?: boolean
    /**是否显示 */
    visible?: boolean
    /**显示快捷键 */
    accelerator?: string
    /**当 type 为 checkbox / radio 时是否选中 */
    checked?: boolean
}
/**创建自定义菜单的函数 */
export type AssetMenuFunction = (assetInfo: AssetInfo) => MenuItem[];
export interface CocosPluginV3AssetsMenu {
    /**菜单时间的处理函数 */
    methods: string;
    /**创建资源菜单现实时触发事件的回调函数*/
    createMenu: string;
    /**右击普通资源节点或目录时触发的事件*/
    assetMenu: string;
    /**右击资源数据库根节点 assets 时触发的事件 */
    dbMenu: string;
    /**右击资源管理面板空白区域时触发的事件 */
    panelMenu: string;
}
export interface CocosPluginV3 {
    name: string;
    version: string;
    description?: string;
    /**
     * 支持的编辑器版本
     */
    editor?: string;
    package_version?: number;
    main: string;
    author?: string;
    contributions?: {
        builder?: string;
        menu?: Array<{ path: string; label: string; message: string }>;
        messages?: Record<string, { methods?: string[] }>;
        /**增强资源管理器面板 */
        assets?: {
            /**自定义菜单右键 */
            menu?: CocosPluginV3AssetsMenu
        },
        shortcuts?: Array<{ message?: string; win?: string; mac?: string }>;
        'asset-db': { mount?: { path: string; readonly: boolean } },
        /**场景脚本 */
        scene?: {
            script: string;
        };
    };
    panels?: Record<string, PanelOptionsV3>;
    dependencies?: string[];
}

export interface PluginMainWrapper {
    /**
     * 创建函数，目前只有electron在用
     */
    create?: Function;
    load: Function;
    unload?: Function;
    builder?: {
        onAfterBuildAssetsFinish?: Function;
        onAfterBuild?: Function;
        onBeforeBuild?: Function;
    };
    messages?: Record<string, Function>;
    /**
     * mcp服务，目前是运行在主进程
     */
    mcp?: PluginMcpTool[];
}

// 目前先加一些自己关心的，后续慢慢添加完善
export interface BuilderOptions {
    buildPath: string; // 构建的输入根目录: build/
    outputPath: string; // 当前平台输出的目录： build/web-mobile
    platform: string; // web-mobile
    md5Cache: boolean;
    /**
     * 所有的资源
     * pathBuild后的输出路径
     * bundle资源所在的bundle
     */
    assets?: { [key: string]: { path: string, bundle: string } };
}

export enum Platform {
    Unknown = 'unknown',
    WebMobile = 'web-mobile',
    WebDesktop = 'web-desktop',
    Android = 'android',
    Ios = 'ios',
    Mac = 'mac',
    Win32 = 'win32',
};

export enum IpcMsg {
    /**
     * 通过Ipc消息获得编辑器的node_modules目录
     */
    EditorNodeModules = "editor-node-modules",
}

export interface PluginMcpTool {
    name: string;
    description: string;
    callback: (args: any) => Promise<string | null>;
    inputSchema: {
        type: string;
        properties: {
            [key: string]: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
}
