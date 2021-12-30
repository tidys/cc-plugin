import { PluginMainWrapper, CocosPluginManifest, CocosPluginOptions, CocosPluginConfig } from '../declare';
import { Panel } from './panel'

export class CocosCreatorPluginMain {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Panel: Panel = new Panel();
    public wrapper: PluginMainWrapper | null = null;

    public init(config: CocosPluginConfig, wrapper: PluginMainWrapper) {
        this.manifest = config.manifest;
        this.options = config.options;
        this.wrapper = wrapper;
        this.Panel.setConfig(config);
    }
}

const CCP = new CocosCreatorPluginMain();
export default CCP;
