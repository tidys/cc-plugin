// 适配各种版本的api，因为游戏废弃的api在高版本中使用，console会一直打印warning，很烦人。
export const Versions = {
    V246: '2.4.6',
    V247: '2.4.7',
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
