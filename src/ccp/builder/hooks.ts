import { join } from 'path'
import { existsSync, readFileSync } from 'fs';
import { BuildInfo } from './type';
/**
 * 目前只能通过读取 package.json 文件来获取插件名称，发送ipc消息的前提是需要知道插件名称
 * 无法使用 CCP.manifest!.name;  因为在单独的进程，所以无法共享CCP，自然也就无法从CCP取配置
 * @returns 插件的名称
 */
function getPackageName() {
    const packageFile = join(__dirname, 'package.json')
    if (!existsSync(packageFile)) {
        console.log(`无法找到文件：${packageFile}`)
        return ""
    }
    try {
        const data = readFileSync(packageFile, 'utf-8')
        const result = JSON.parse(data)
        return result.name || "";
    } catch (e: any) {
        return "";
    }
}

// 运行在单独的构建面板中，可以通过构建面的渲染进程，打开 资源构建 进程调试 工具
export function onAfterBuild(buildOptions: any, buildResult: any) {
    debugger
    const pkgName = getPackageName();
    if (!pkgName) {
        console.error('无法获取插件名称')
        return;
    }
    /**
     * TODO: 这个参数也是写死的, 后续需要优化
     * 关联的地方：
     *  package.json的contributions.message.onBuilder
     *  src\ccp\main-v3.ts的methods.onBuilder
     **/
    const func = 'onBuilder';
    // 参数暂时放到main-v3中进行整理
    const { buildPath, name, outputName, platform, md5Cache } = buildOptions;
    // @ts-ignore 发送到主进程
    Editor.Message.request(pkgName, func, {
        type: 'onAfterBuild',
        data: { buildPath, name, outputName, platform, md5Cache }
    } as BuildInfo);
}
