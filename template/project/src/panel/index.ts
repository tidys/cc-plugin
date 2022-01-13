import { createApp } from 'vue'
// @ts-ignore
import App from './index.vue'
// @ts-ignore
import CCP from 'cc-plugin/src/ccp/entry-render';
import pluginConfig from '../../cc-plugin.config'

// 使用cc-plugin内置的ui
// @ts-ignore
import ccui from 'cc-plugin/src/ui/packages/index'
import 'cc-plugin/src/ui/iconfont/use.css'
import 'cc-plugin/src/ui/iconfont/iconfont.css'

export default CCP.init(pluginConfig, {
    ready: function (rootElement: any, args: any) {
        const app = createApp(App)
        app.use(ccui)
        app.mount(rootElement)
    }
})
