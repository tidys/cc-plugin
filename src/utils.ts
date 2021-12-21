import { CocosPluginManifest, CocosPluginOptions } from './declare';

class Utils {
    private manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;

    init(manifest: CocosPluginManifest, options: CocosPluginOptions) {
        this.manifest = manifest;
        this.options = options;
    }

    i18n(key: string) {
        const pkgName = this.manifest!.name;
        return `i18n:${pkgName}.${key}`
    }
}

const utils = new Utils();
export default utils;
