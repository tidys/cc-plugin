import { networkInterfaces } from "os";
import { Base } from './base';
export class IP extends Base {
    /**
     * 通过RTC获取本地IP
     * 更优的做法是初始化的时候获取IP，这样就不会造成async/await的污染
     */
    private _getIpByRTC(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const pc = new window.RTCPeerConnection({ iceServers: [] });
            pc.onicecandidate = (ice) => {
                if (ice.candidate) {
                    const addr = ice.candidate.address;
                    if (addr && addr.split(".").length === 4) {
                        resolve(addr);
                    } else {
                        // https://gist.github.com/hectorguo/672844c319547498dcb569df583f959d
                        // 匿名得到的就是03a79ea5-2365-4ea2-b8a9-b9d11896fb8a.local
                        // 这个网址还不能主动打开
                        console.log(`chrome浏览器需要设置:  chrome://flags/#enable-webrtc-hide-local-ips-with-mdns 为disabled`);
                        resolve("");
                    }
                }
            };
            pc.createDataChannel("");
            pc.createOffer(pc.setLocalDescription.bind(pc), () => { });
        });
    }
    public checkIp(ip: string) {
        const arr = ip.split(".");
        if (arr.length !== 4) {
            return "ip格式不正确";
        }
        for (let i = 0; i < arr.length; i++) {
            const num = parseInt(arr[i]);
            if (num < 0 || num > 255) {
                return `ip段${num}必须在[0-255]`;
            }
        }
        return "";
    }
    async getLocalIP(): Promise<string> {
        let ip = "";
        if (this.adaptation.Env.isWeb) {
            ip = await this._getIpByRTC();
            return ip;
        } else {
            const faces = networkInterfaces();
            Object.keys(faces).forEach((name) => {
                const item = faces[name];
                if (item) {
                    item.forEach((face) => {
                        if ("IPv4" !== face.family || face.internal !== false) {
                            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                            return;
                        }
                        ip = face.address;
                    });
                }
            });
            return ip;
        }
    }
}