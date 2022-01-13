# cc-plugin

专为`Cocos Creator`插件开发的cli，一次编写，同时发布v2，v3版本，免去多版本同步的问题。

使用webpack抹平了v2、v3插件版本的底层差异，使开发插件更加工程化。

推荐使用typescript开发插件，更丝滑流畅。
## 特点

- 使用 typescript + vue 开发
- 完美适配所有版本的creator
- 完善的工作流：一键创建插件、打包插件、发布插件

## 如何使用

1. 全局安装，命令行关键字cc-plugin、ccp都支持

```shell
npm install cc-plugin -g
```

2. 在当前的目录创建项目
```shell
cc-plugin create my-first-plugin
```

3. 安装依赖，推荐yarn，后续版本会将这一步自动化
```shell
cd ./my-first-plugin
npm install
yarn install
```
4. 构建插件
```shell
cc-plugin serve
```
5. 打包插件
```shell
cc-plugin pack
```
玩的开心！

## cc-plugin.config.ts 配置

cc-plugin通过`cc-plugin.config.ts`文件来配置管理插件

```typescript
import { CocosPluginManifest, CocosPluginOptions, Panel, PluginVersion } from 'cc-plugin/src/declare';

// 插件的清单信息
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

// 插件的构建配置
const options: CocosPluginOptions = {
    version: PluginVersion.v2, // 发布的creator插件版本
    server: { // hot reload server，开发过程中会自动进行插件的reload
        enabled: true,
        port: 2022,
    },
    outputProject: { // 最终插件的输出目录，必须是绝对路径，指向项目路径即可
        v2: '/cocos-creator/project-v2/',
        v3: '/cocos-creator/project-v3/',
    },
    min: false,// 压缩代码
    treeShaking: false,//剔除无效的代码逻辑
}
export default { manifest, options };

```

插件的主进程代码

```typescript

import pluginConfig from '../cc-plugin.config';
import CCP from 'cc-plugin/src/ccp/index';
import { BuilderOptions } from 'cc-plugin/src/declare'

CCP.init(pluginConfig, {
    load: () => {
        return 'plugin-load'
    },
    builder: {
        onAfterBuild(target: BuilderOptions) {

        }
    },
    messages: {
        showPanel() {
            CCP.Panel.open('self.main');
        }
    }
});

```
插件的渲染进程，主要是针对插件面板

```typescript
import { createApp } from 'vue'
import App from './index.vue'
import CCP from 'cc-plugin/src/ccp/entry-render';
import pluginConfig from '../../cc-plugin.config'

// 使用cc-plugin内置的ui
// @ts-ignore
import ccui from 'cc-plugin/src/ui/packages/index'
import 'cc-plugin/src/ui/iconfont/use.css'
import 'cc-plugin/src/ui/iconfont/iconfont.css'

export default CCP.init(pluginConfig, {
    ready: function (rootElement, args: any) {
        const app = createApp(App)
        app.use(ccui)
        app.mount(rootElement)
    }
})
```
