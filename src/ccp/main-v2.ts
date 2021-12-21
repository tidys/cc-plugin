import CCP from './index'

export const load = CCP.wrapper?.load || (() => {
    console.log('load')
    return 0;
})

export const messages = CCP.wrapper?.messages || {}
