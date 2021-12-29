export interface MenuOptions {
    path: string;
    icon?: string;
    accelerator?: string;
    message: string;
}

export interface PanelOptions {
    main: string;
    name: string;
    title: string;
    type?: string;
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
    output?: string, // 最终都要变成绝对路径
    cwd?: string;
    version?: PluginVersion;
    min?: boolean;// 压缩
    treeShaking?: boolean;
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

export abstract class AbstractPluginPanel {
    abstract ready(rootElement: any, args: any): void;
}

export interface PluginMainWrapper {
    load: Function
    messages?: Record<string, Function>;
}

