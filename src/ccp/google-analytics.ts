/**
 * 发送的消息数据结构
 *
 * @doc https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#payload_post_body
 * @github https://github.dev/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/scripts/google-analytics.js#L69
 */
export interface MeasurementBody {
    /**
     * 用户的ID，用于标识用户
     */
    client_id: string;
    /**
     * 用户的唯一标识，只能包含 utf-8 字符。
     */
    user_id?: string;
    /**
     * 事件相关联的时间的 UNIX 时间戳，此值应仅设置为记录过去发生的事件。
     */
    timestamp_micros?: number;
    /**
     * 用户属性用于描述用户群细分，例如语言偏好设置或地理位置。
     *
     * @doc https://developers.google.com/analytics/devguides/collection/protocol/ga4/user-properties?hl=zh-cn&client_type=gtag
     */
    user_properties?: Object;
    /**
     * 用户提供的数据。
     *
     *@doc https://developers.google.com/analytics/devguides/collection/ga4/uid-data?hl=zh-cn
     */
    user_data?: Object;
    /**
     * 设置请求的用户意见征求设置。
     * @doc https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#payload_consent
     */
    consent?: Object;
    /**
     * 每个请求最多可以发送 25 个事件
     */
    events?: MeasurementEvent[];
}

export interface MeasurementEvent {
    /**
     * 事件的名称。
     *
     * Google提供的事件： https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events?hl=zh-cn#add_payment_info
     * 预留的事件名：https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#reserved_event_names
     */
    name: string;
    /**
     * 预留的参数名：https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#reserved_parameter_names
     */
    params?: {
        [key: string]: any;
        /**
         * 在实时报告中查看事件，需要该参数
         */
        session_id?: string;
        /**
         * 事件的互动时长（以毫秒为单位）
         */
        engagement_time_msec?: string;
    };
}

/**
 * 我个人github的GA4
 */
export const GA_Github = {
    measurementID: "G-L2EQEMCV5L",
    apiSecret: "1zACEkCyR4uh65r3SO_baA",
}
export class GoogleAnalytics {
    /**
     * API 密钥用于验证您的请求。一般长度是22
     */
    private apiSecret = "";
    /**
     * 测量 ID 用于标识您的 GA4 帐户。
     */
    private measurementID = "";
    private endPoint = "https://www.google-analytics.com/mp/collect";
    private fingerprint: string = '';
    constructor() {
        if (typeof navigator !== 'undefined' && typeof screen !== 'undefined' && typeof document !== 'undefined') {
            this.fingerprint = this.generateBrowserFingerprint();
        }
    }
    public initID(apiSecret: string, measurementID: string) {
        this.apiSecret = apiSecret;
        this.measurementID = measurementID;
    }
    private generateBrowserFingerprint() {
        const features = {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
            webgl: this.getWebGLFingerprint(),
            canvas: this.getCanvasFingerprint(),
            fonts: this.detectFonts()
        };

        return this.hashString(JSON.stringify(features));
    }

    private getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return '';
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return gl.getParameter(debugInfo!.UNMASKED_RENDERER_WEBGL);
        } catch (e) {
            return '';
        }
    }

    private getCanvasFingerprint() {
        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.fillText('BrowserFingerprint', 2, 2);
        }
        return canvas.toDataURL().slice(-16);
    }

    private detectFonts() {
        const baseFonts = ['Arial', 'Times New Roman', 'Courier New'];
        return baseFonts.filter(font => {
            return document.fonts.check(`12px "${font}"`);
        }).join(',');
    }

    private hashString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    }
    public fire(name: string, param: string = "") {
        if (!this.measurementID || !this.apiSecret) {
            return;
        }
        const time = Date.now();
        const event: MeasurementEvent = {
            name: name,
            params: {
                session_id: time.toString(),
                engagement_time_msec: time.toString(),
            },
        }
        if (param && event.params) {
            event.params['id'] = param;
        }
        fetch(`${this.endPoint}?measurement_id=${this.measurementID}&api_secret=${this.apiSecret}`, {
            method: "POST",
            body: JSON.stringify({
                client_id: this.fingerprint,
                events: [event],
            } as MeasurementBody),
        })
            .then(() => { })
            .catch((e) => {
                console.error(e);
            });

    }

}