import qrcode from 'qrcode-terminal'
import { log } from '../log';
export function showWeChatQrCode() {
    log.green('玩的开心，遇到问题，联系作者QQ 774177933 微信 xu__yanfeng')
    log.green('微信扫码联系我，备注cc-plugin')
    const weChat = "https://u.wechat.com/EOdEf3T2P9X6JDEv2M-cl64";
    qrcode.generate(weChat, { small: true });
}