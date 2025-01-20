export const ChromeConst = {
    script: {
        background: 'background.js',
        content: 'content.js',
        /**
         * inject.js脚本是由content.js进行注入的
         */
        inject: 'inject.js',
    },
    css: {
        inject_view: 'inject_view.css',

    },
    html: {
        options: 'options.html',
        popup: 'popup.html',
        inject_view: 'inject_view.html',
        devtools: 'devtools.html',
    }
}
export const ChromePanelMsg = {
    Show: 'show',
    Hide: 'Hide',
    Search: 'search',
}