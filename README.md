# cc-plugin

专为`Cocos Creator`插件开发的cli，一次编写，同时发布web网页版本、creator v2版本、creator v3版本，免去多版本同步的问题。

使用webpack抹平了v2、v3插件版本的底层差异，使开发插件更加工程化。

推荐使用typescript开发插件，更丝滑流畅。

## 开源案例
[icon-tools](https://github.com/son-king/icon-tool)

[cocos store](https://store.cocos.com/app/detail/3981)支持一下呗

## 特点

- 使用 typescript + vue 开发
- 完美适配所有版本的creator
- 完善的工作流：一键创建插件、打包插件、发布插件

## 打包插件的优势
使用官方提供的插件模板，如果使用到了node的第三方package，在发布插件的时候需要将node_modules目录一起上传，会导致插件的文件数量非常多，而且插件体积也会稍微变大。

creator文件在安装解压插件时，会出现node_modules目录解压失败等异常问题，导致插件运行起来出现问题，目前我的确是收到用户反馈过类似的问题。

cc-plugin因为使用了webpack，会将项目代码及其依赖的devDependencies统一进行打包，尽可能减少插件自身的文件数量，对减少插件体积大小也有一定的效果，同时也避免了安装解压失败导致插件运行的问题。

注意是`devDependencies`，不是`dependencies`，所以如果你想将`node package`打包进插件，需要将`node package`添加到`devDependencies`中。

这么设计也是考虑到了某些`package`不支持web环境，这些`package`只能配置到`dependencies`中，否则会导致打包失败，比如fs模块等。

## 如何使用

1. 全局安装，命令行关键字cc-plugin、ccp都支持

    ```shell
    npm install cc-plugin -g
    ```

2. 在当前的目录创建项目，不推荐放到creator项目的packages/extensions目录
    ```shell
    cc-plugin create my-first-plugin
    ```

3. 安装依赖
    ```shell
    cd ./my-first-plugin
    yarn install # 推荐yarn
    ```
4. 运行插件
   - 必须使用这种方式，直接调用的是项目本地安装的cc-plugin
        ```
        npm run ccp-serve-web
        npm run ccp-serve-v2
        npm run ccp-serve-v3
        ```
    - 这种方式调用的是全局安装的cc-plugin，会导致build结果异常，暂时没有将`cli`和`runtime code`剥离的计划。
        ```shell
        cc-plugin serve web
        cc-plugin serve cp-v2
        cc-plugin serve cp-v3
        ```
5. 打包插件
    ```
    npm run ccp-pack-web
    npm run ccp-pack-v2
    npm run ccp-pack-v3
    ``` 

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
    outputProject: { 
        // 最终插件的输出目录，必须是指向creator项目的绝对路径
        // 该配置项会优先从cc-plugin.json中获取
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
## 对插件开发有用的小工具

```shell
npm i @xuyanfeng/cc-editor -g 
```
插件开发过程中需要在不同的creator版本进行自测，通过 [cc-editor](https://github.com/cocos-creator-plugin/cc-editor) 快速切换配置项，而且cc-editor自身还增加了调试主进程的参数，提高插件开发效率。

## 关于options.outputProject
在`cc-plugin.config.ts`中我们会配置不同类型插件的输出目录，`cc-plugin.config.ts`是需要纳入版本管理的。

但是有可能你需要在多台电脑上进行开发，outputProject的配置也不同，修改`cc-plugin.config.ts`肯定不行，容易造成冲突。

`cc-plugin`考虑到了这种情况，你可以在同目录新建一个`cc-plugin.json`文件，内容如下：
```json
{
    "v2":"xx",
    "v3":"xx",
    "chrome": "xx"
}
```
`cc-plugin.json`不建议纳入版本管理，它更像是一个本机配置，满足了不同电脑，配置不同的需求。
`cc-plugin`检索`outputProject`时会优先从`cc-plugin.json`中读取配置。

## `__DEV__` / `__DEV_WORKSPACE__`
- `__DEV__`: 用于判断是否为ccp的serve环境
- `__DEV_WORKSPACE__`：serve环境下的工作空间路径

## `__VALID_CODE__`

有时我们希望某些代码不出现在打包后的项目中，比如导出生成最终的产出文件，发布为creator插件我们是必须有的，但是web的引流体验版本我们是不能携带的，原因大家懂得。

解决办法也有：
1.  通过简单的localStorage进行校验，但是这些逻辑都是存在本地的，用户通过调试代码还是很容易找到破解办法的
2.  将生成逻辑存放在服务器上，但是这样我们还得购买服务器，得不偿失，而且通过调试代码，用户还是能够通过一些手段伪装骗过服务器，这样又得做防伪校验

以上是常规的处理办法，都存在被破解的办法，根本原因还是web版本提供了对应的导出逻辑支持，一旦用户发现如何用web版本导出，就失去了很多潜在的付费用户。


要解决这个问题，只有一种办法，代码里面没有任何的相关逻辑，所以我们必须提供一个机制，打包后把相关的代码真正剔除掉。

`__VALID_CODE__`就应运而生，即使你知道了cc-plugin的相关逻辑，你也无法获取对应的导出逻辑，真正的从源头防破解，因为打包后的代码压根就没有任何相关的逻辑。

### 用例
在你的项目中将导出逻辑包含在`__VALID_CODE__`的判断中
```ts
 // @ts-ignore
if (!!__VALID_CODE__) {
    // your export code
}
```

执行`cc-plugin pack web --validCode=true`，validCode选项直接决定了`__VALID_CODE__`的值，当为false时，pack后就会将相关的逻辑剔除掉。

## 关于一些native能力的package

比如nodejs的`fs`模块，当你的插件中使用到了`fs`模块，一般我们都会如下这么使用
```ts
import {readFileSync} from 'fs'
```
如果你的插件要发布web版本，cc-plugin会自动将`fs`模块替换为`fs-browserify`模块，`fs-browserify`对`fs`的大部分接口进行了空实现，这样的好处是你`无需改动代码`，也能编译出可以运行的web版本，再也不用像以下这样麻烦的适配:

```ts
if(!isWeb){
  const {readFileSync} = require('fs')
}
```

需要注意的是，`fs`的一些操作，我们还是需要`isWeb`的判断，不过一般我们都是将这些逻辑放在一个专有函数，并且有些功能能否在web环境正常运行，我们开发的时候就是非常明确的，我们只需要做好类似的判断处理即可。

我自己已经实现的空的`browserify`有:

- [express-browserify](https://www.npmjs.com/package/@xuyanfeng/express-browserify)
- [fs-extra-browserify](https://www.npmjs.com/package/@xuyanfeng/fs-extra-browserify)
- [fs-browserify](https://www.npmjs.com/package/@xuyanfeng/fs-browserify)
