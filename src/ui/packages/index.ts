import { App } from 'vue';
import * as components from './components'


import Section from './cc-section'
import Input from './cc-input'
import Prop from './cc-prop'
import Select from './cc-select'
import Textarea from './cc-textarea'
import Button from './cc-button'

const components1 = [
    Button, Select, Section, Prop, Textarea, Input
]
debugger
const install = (app: App) => {
    Object.keys(components).forEach(key => {
        // @ts-ignore
        app.use(components[key])
    })
};

export default { install }
