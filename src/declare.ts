export interface MenuOptions {
    path: string;
    icon?: string;
    accelerator?: string;
    message: {
        panel?: string, // 发送给哪个面板
        name: string, // 消息名字
    };
}

export interface PanelOptions {
    main: string;
    name: string;
    title: string;
    type: string;
    icon?: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
}

export const Panel = {
    Type: {
        Dockable: 'dockable',
    },

};

export interface CocosPluginManifest {
    name: string;
    main: string;
    version: string;
    description?: string;
    author?: string;
    panels?: PanelOptions[];
    menus?: MenuOptions[];
    i18n_zh?: string;
    i18n_en?: string;
}

export enum PluginVersion {
    v2,
    v3,
}

export interface CocosPluginOptions {
    watch?: boolean;
    hot?: boolean;
    outputProject: string | { v2?: string, v3?: string },// 输出的项目路径
    output?: string, // 最终都要变成绝对路径
    cwd?: string;
    version?: PluginVersion;
    min?: boolean;// 压缩
    treeShaking?: boolean;
}

export interface CocosPluginConfig {
    manifest: CocosPluginManifest,
    options: CocosPluginOptions
}

export interface CocosPluginV2 {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    'main-menu'?: Record<string, { icon?: string, message?: string, accelerator?: string }>;
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
        menu?: Array<{ path: string, label: string, message: string }>,
        messages?: Record<string, { methods?: string[] }>,
        shortcuts?: Array<{ message?: string, win?: string, mac?: string }>,
    };
    panels?: Record<string, {
        type: string,
        main: string,
        title?: string,
        icon?: string,
        width?:number,
        height?:number,
        'min-width'?:number,
        'min-height'?:number,
    }>;
    dependencies?: string[];
}

export interface PluginMainWrapper {
    load: Function
    messages?: Record<string, Function>;
}

