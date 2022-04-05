import {
    CocosPluginConfig,
    CocosPluginManifest,
    CocosPluginOptions,
    DefaultCocosPluginOptions,
    PluginMainWrapper,
    PluginType,
} from '../declare';
import adaptation, {Adaptation} from './adaptation'

export class CocosCreatorPluginMain {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = adaptation;
    public wrapper: PluginMainWrapper | null = null;
    public isV2: boolean = true;

    public init(config: CocosPluginConfig, wrapper: PluginMainWrapper) {
        const { type } = config.options;
        this.isV2 = type === PluginType.PluginV2;
        this.manifest = config.manifest;
        this.options = Object.assign(DefaultCocosPluginOptions, config.options);
        this.wrapper = wrapper;
        this.Adaptation.init(config, type || PluginType.PluginV2)
    }
}

const CCP = new CocosCreatorPluginMain();
export default CCP;
