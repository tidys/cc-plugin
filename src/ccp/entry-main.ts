import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginMainWrapper,
    PluginType,
} from '../declare';
import { Adaptation } from './adaptation'

export class CocosCreatorPluginMain {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = new Adaptation();
    public wrapper: PluginMainWrapper | null = null;

    public init(config: CocosPluginConfig, wrapper: PluginMainWrapper) {
        this.manifest = config.manifest;
        this.options = Object.assign(DefaultCocosPluginOptions, config.options);
        this.wrapper = wrapper;
        this.Adaptation.init(config)
    }
}

const CCP = new CocosCreatorPluginMain();
export default CCP;
