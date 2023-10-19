export interface MenuOptions {
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
  icon?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  ejs?: string; // 自定义面板模板
  ejsOptions?: Record<string, any>; // 自定义面板模板参数
}

export const Panel = {
  Type: {
    DockAble: "dockable",
    Simple: "simple",
    InnerIndex: "inner-index",
  },
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

export enum PluginType {
  PluginV2, // cocos creator 插件v2版本
  PluginV3, // cocos creator 插件v3版本
  Web, // web页面
  Electron, // 桌面应用
  Vscode, // vscode插件
}

export interface CocosPluginOptions {
  // hmr server
  server?: {
    enabled?: boolean;
    port?: number; // 监听端口，需要优化判断下端口是否占用的问题
  };
  watchBuild?: boolean; // 监听构建
  outputProject:
    | string
    | {
        v2?: string;
        v3?: string;
        web?: string;
        vscode?: string;
        electron?: string;
      }; // 输出的项目路径
    /**
     * 发布文件的输出目录，支持相对路径和绝对路径
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

// 一些默认值
export const DefaultCocosPluginOptions: CocosPluginOptions = {
  outputProject: "./",
  output: "./dist",
  type: PluginType.PluginV2,
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
  "main-menu"?: Record<
    string,
    { icon?: string; message?: string; accelerator?: string }
  >;
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
    menu?: Array<{ path: string; label: string; message: string }>;
    messages?: Record<string, { methods?: string[] }>;
    shortcuts?: Array<{ message?: string; win?: string; mac?: string }>;
  };
  panels?: Record<
    string,
    {
      type: string;
      main: string;
      title?: string;
      icon?: string;
      width?: number;
      height?: number;
      "min-width"?: number;
      "min-height"?: number;
    }
  >;
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

// 目前先加一些自己关心的，后续慢慢添加完善
export interface BuilderOptions {
  buildPath: string; // 构建的输入根目录: build/
  outputPath: string; // 当前平台输出的目录： build/web-mobile
  platform: string; // web-mobile
  md5Cache: boolean;
}

export const Platform = {
  WebMobile: "web-mobile",
  WebDesktop: "web-desktop",
  Android: "android",
  Ios: "ios",
  Mac: "mac",
  Win32: "win32",
};
