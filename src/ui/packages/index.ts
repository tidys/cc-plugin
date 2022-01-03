import { App } from 'vue';
import * as components from './components'

const install = (app: App) => {
    Object.keys(components).forEach(key => {
        // @ts-ignore
        app.use(components[key])
    })
};

export default { install }
