import { CocosPluginConfig, CocosPluginManifest, CocosPluginOptions, DefaultCocosPluginOptions, PluginMainWrapper, PluginType, } from '../declare';
import { Adaptation } from './adaptation'
import { Mcp, mcp } from './mcp';

export class CocosCreatorPluginMain {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = new Adaptation();
    public wrapper: PluginMainWrapper | null = null;
    /**方便用户持有，然后进行链接 */
    public mcp: Mcp = mcp;

    public init(config: CocosPluginConfig, wrapper: PluginMainWrapper) {
        this.manifest = config.manifest;
        this.options = Object.assign(DefaultCocosPluginOptions, config.options);
        this.wrapper = wrapper;
        this.Adaptation.init(config)
        this.initMcp(wrapper);
    }
    private initMcp(wrapper: PluginMainWrapper) {
        debugger
        if (wrapper.mcp && wrapper.mcp.length) {
            mcp.connect();
        }
    }
}

const CCP = new CocosCreatorPluginMain();
export default CCP;
