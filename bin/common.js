"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidMenus = exports.getValidPanels = exports.getV3MethodFunctionName = exports.getV3PanelRecvMessageFunctionName = exports.flag = void 0;
exports.flag = 'recv_entry';
/**
 * 定义一个插件面板收取数据的消息函数名称，方便数据发送的时候知道应该发送到哪个消息
 * 该函数是面板收取数据的入口，开发者可以根据参数识别进行二次分发处理
 */
function getV3PanelRecvMessageFunctionName(panel) {
    return `${panel}-${exports.flag}`;
}
exports.getV3PanelRecvMessageFunctionName = getV3PanelRecvMessageFunctionName;
function getV3MethodFunctionName(panel) {
    return `${panel}.${exports.flag}`;
}
exports.getV3MethodFunctionName = getV3MethodFunctionName;
function getValidPanels(panels) {
    if (!panels) {
        return [];
    }
    const ret = panels.filter(panel => {
        return !(panel.valid === false);
    });
    return ret;
}
exports.getValidPanels = getValidPanels;
function getValidMenus(menus) {
    if (!menus) {
        return [];
    }
    const ret = menus.filter(menu => {
        return !(menu.valid === false);
    });
    return ret;
}
exports.getValidMenus = getValidMenus;
//# sourceMappingURL=common.js.map