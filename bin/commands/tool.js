"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWeChatQrCode = void 0;
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const log_1 = require("../log");
function showWeChatQrCode() {
    log_1.log.green('玩的开心，遇到问题，微信扫码联系我，备注cc-plugin');
    const weChat = "https://u.wechat.com/EOdEf3T2P9X6JDEv2M-cl64";
    qrcode_terminal_1.default.generate(weChat, { small: true });
}
exports.showWeChatQrCode = showWeChatQrCode;
