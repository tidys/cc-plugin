// import { createApp } from 'vue'
// import index from './index.vue'

// 仅仅做了tsc，所以没办法使用vue
// const app = createApp(index);

//@ts-ignore
const panels = window.pluginPanels || [];
console.log(panels);
const app = document.getElementById("app") || document.body;
if (panels.length > 0) {
    if (panels.length === 1 && panels[0].href) {
        window.location.href = panels[0].href
    } else {
        for (let i = 0; i < panels.length; i++) {
            const panel = panels[i];
            const a = document.createElement("a");
            a.text = panel.label || "label";
            a.href = panel.href || "href";
            app.append(a);
        }
    }
}