import { ProjectConfig } from 'service';
import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, PluginType } from './declare';

class Utils {
    private manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    private _init: boolean = false;
    // 内置的菜单
    public builtinMenu = {
      /**
       * 项目菜单
       */
        project: '',
      /**
       * 节点菜单
       */
      node: '',
      /**
       * 面板菜单
       */
      panel: '',
        /**
     * 扩展菜单
     */
        package: '',
      /**
       * 开发者菜单
       */
      develop: "",
    }
    init(config: ProjectConfig) {
        this._init = true;
        this.manifest = config.manifest;
        this.options = config.options;
        const { type } = config;
        if (type === PluginType.PluginV2) {
            this.builtinMenu.project = this.toi18n('MAIN_MENU.project.title')
            this.builtinMenu.package = this.toi18n('MAIN_MENU.package.title');
        } else if (type === PluginType.PluginV3) {
            this.builtinMenu.project = this.toi18n('menu.project')
          this.builtinMenu.node = this.toi18n('menu.node');
          this.builtinMenu.panel = this.toi18n('menu.panel');
          this.builtinMenu.package = this.toi18n('menu.extension');
          this.builtinMenu.develop = this.toi18n('develop');
        }
    }
    menuProject(name: string, i18n: boolean = true): string {
        if (!this._init) {
            console.error("need init");
            return "";
        }
        return `${utils.builtinMenu.project}/${i18n ? this.i18n(name) : name}`;
    }
    menuPackage(name: string, i18n: boolean = true): string {
        if (!this._init) {
            console.error("need init");
            return "";
        }
        return `${utils.builtinMenu.package}/${i18n ? this.i18n(name) : name}`;
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
