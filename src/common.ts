import { MenuOptions, PanelOptions } from "declare"

export const flag = 'recv_entry'
/**
 * 定义一个插件面板收取数据的消息函数名称，方便数据发送的时候知道应该发送到哪个消息
 * 该函数是面板收取数据的入口，开发者可以根据参数识别进行二次分发处理
 */
export function getV3PanelRecvMessageFunctionName(panel: string) {
    return `${panel}-${flag}`
}

export function getV3MethodFunctionName(panel: string) {
    return `${panel}.${flag}`
}

export function getValidPanels(panels: PanelOptions[] | undefined): PanelOptions[] {
    if (!panels) {
        return []
    }
    const ret = panels.filter(panel => {
        return !(panel.valid === false)
    })
    return ret
}

export function getValidMenus(menus: MenuOptions[] | undefined): MenuOptions[] {
    if (!menus) {
        return []
    }
    const ret = menus.filter(menu => {
        return !(menu.valid === false)
    })
    return ret
}