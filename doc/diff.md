## menu

zh.js

```js
exports = {
    title: '热更新工具',
}
```

菜单：`项目/热更新工具`的不同版本写法：

# v2

```json5
{
  'main-menu': {
    'i18n: MAIN_MENU.project.title/i18n:pluginID.title': {
      message: 'plugID:funcName'
    }
  }
}
```

# v3

```json5

{
  path: 'i18n:menu.project',
  label: 'i18n:pluginID.title',
  message: ''
}
```

实际发现label的`/`也会被放到path中进行分割显示，显示名字的时候会以label实际为准，比较混乱，统一label不允许有`/`分割

框架层统一采用v2版本的格式进行path编写
