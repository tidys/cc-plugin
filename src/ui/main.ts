import { createApp } from 'vue';
import App from './app.vue';
import CCUI from './packages/index';

const app = createApp(App);
app.use(CCUI);
app.mount('#app');
