# cc-plugin

专为`Cocos Creator`插件开发的cli，一次编写，同时发布v2，v3版本，免去多版本同步的问题。

大致实现原理就是使用webpack抹平了v2、v3插件版本的底层差异，使开发插件更加工程化。

推荐使用typescript开发插件，更丝滑流畅。

## 使用

`cc-plugin.config.ts`配置如下

```typescript
import { CocosPluginManifest, CocosPluginOptions, Panel, PluginVersion } from 'cc-plugin/src/declare';

const manifest: CocosPluginManifest = {
    name: 'test-plugin',// 插件的名字
    version: '1.0.0',// 插件的版本号
    description: 'my first plugin',// 插件的描述
    author: "cocos creator",// 插件作者
    main: './src/main.ts',// 主进程的代码相对路径
    panels: [],// 插件的面板
    menus: [],// 插件的菜单
    i18n_en: './src/en.ts',
    i18n_zh: './src/zh.ts',
}
const options: CocosPluginOptions = {
    version: PluginVersion.v2, // 发布的creator版本
    output: '/cocos-creator/project/packages/test-plugin', // 最终插件的输出目录，必须是绝对路径
    min: false,// 压缩代码
    treeShaking: false,//剔除无效的代码逻辑
}
export default { manifest, options };

```

为了保证代码的兼容性，插件的主进程代码`manifest.main`需要这样写

```typescript

import pluginConfig from '../cc-plugin.config';
import CCP from 'cc-plugin/src/ccp/index';

CCP.init(pluginConfig.manifest, pluginConfig.options, {
    load: () => {
        return 'plugin-load'
    },
    messages: {
        showPanel() {
            CCP.Panel.open('self.main');
        }
    }
});

```

## panels

```typescript
interface PanelOptions {
    main: string;// 面板的入口逻辑相对路径 './src/panel/index.ts',
    name: string;
    title: string;
    type?: string;//面板类型：可选值 Panel.Type.Dockable
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
}
```

## menus

```typescript
 interface MenuOptions {
    path: string;
    icon?: string;
    accelerator?: string;
    message: string;
}

```

## 创建运行项目
```shell
npm install cc-plugin -g
cc-plugin create my-first-plugin
cd ./my-first-plugin
npm install
cc-plugin serve
```
