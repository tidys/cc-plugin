// @ts-ignore
import { CocosPluginManifest, CocosPluginOptions, Panel, PluginType } from 'cc-plugin/src/declare';

const pkgName = '%pkg_name%';


function i18n(key: string) {
    return `i18n:${pkgName}.${key}`;
}

const manifest: CocosPluginManifest = {
    name: pkgName,
    version: '1.0.0',
    description: '%pkg_name%',
    author: 'cc-plugin',
    main: './src/main.ts',
    panels: [
        {
            name: 'main',
            type: Panel.Type.DockAble,
            main: './src/panel/index.ts',
            title: '%pkg_name%',
            width: 500,
            height: 400,
            minWidth: 50,
            minHeight: 400,
        },
    ],
    menus: [
        {
            path: `%pkg_name%/${i18n('title')}`,
            message: {
                name: 'showPanel',
            },
        },
    ],
    i18n_en: './src/i18n/en.ts',
    i18n_zh: './src/i18n/zh.ts',
};
// 这里的options变量名暂时不支持修改，发布时会进行必要的修改
const options: CocosPluginOptions = {
    server: {
        enabled: true,
        port: 2022,
    },
    watchBuild: true,
    outputProject: {
        web: './web',
        v2: '', // 这里的路径需要替换为指向creator v2的项目
        v3: '', // 这里的路径需要替换为指向creator v3的项目
    },
};
export default { manifest, options };
