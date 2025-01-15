export const ChromeConst = {
    script: {
        background: 'background.js',
        content: 'content.js',
        /**
         * inject.js脚本是由content.js进行注入的
         */
        inject: 'inject.js',
    },
    html: {
        options: 'options.html',
        popup: 'popup.html',
        devtools: 'devtools.html',
    }
}
export const ChromePanelMsg = {
    Show: 'show',
    Hide: 'Hide',
    Search: 'search',
}