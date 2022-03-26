import { CocosPluginManifest, CocosPluginOptions, PluginType } from './declare';

class Utils {
    private manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;

    // 内置的菜单
    public builtinMenu = {
        project: '',
    }

    init(manifest: CocosPluginManifest, options: CocosPluginOptions) {
        this.manifest = manifest;
        this.options = options;
        const { type } = options;
        if (type === PluginType.PluginV2) {
            this.builtinMenu.project = this.toi18n('MAIN_MENU.project.title')
        } else if (type === PluginType.PluginV3) {
            this.builtinMenu.project = this.toi18n('menu.project')
        }
    }

    i18n(key: string) {
        const pkgName = this.manifest!.name;
        return this.toi18n(`${pkgName}.${key}`);
    }

    toi18n(key: string) {
        return `i18n:${key}`;
    }
}

const utils = new Utils();
export default utils;
