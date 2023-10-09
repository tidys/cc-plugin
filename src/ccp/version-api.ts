// 适配各种版本的api，因为游戏废弃的api在高版本中使用，console会一直打印warning，很烦人。
export const Versions = {
    V232: '2.3.2',
    V233: '2.3.3',
    V234: '2.3.4',
    V240: '2.4.0',
    V241: '2.4.1',
    V242: '2.4.2',
    V243: '2.4.3',
    V244: '2.4.4',
    V245: '2.4.5',
    V246: '2.4.6',
    V247: '2.4.7',
    V248: '2.4.8',
    V249: '2.4.9',
    V2410: '2.4.10',
    V2411: '2.4.11',

    V300: '3.0.0',
    V301: '3.0.1',
    V310: '3.1.0',
    V311: '3.1.1',
    V312: '3.1.2',
    V320: '3.2.0',
    V321: '3.2.1',
    V330: '3.3.0',
    V331: '3.3.1',
    V332: '3.3.2',
    V340: '3.4.0',
    V341: '3.4.1',
    V342: '3.4.2',
    V350: '3.5.0',
    V351: '3.5.1',
    V352: '3.5.2',
}

interface Options {
    version: string | string[],
    fn: Function;
}

export function versionApi(version: string, configArray: Options[], defaultFn: Function): any {
    let targetConfig = configArray.find(config => {
        if (!Array.isArray(config.version)) {
            config.version = [config.version];
        }
        return config.version.find(el => el === version);
    })

    if (targetConfig) {
        return targetConfig.fn()
    } else {
        return defaultFn();
    }
}
