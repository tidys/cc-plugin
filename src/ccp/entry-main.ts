import {
    PluginMainWrapper,
    CocosPluginManifest,
    CocosPluginOptions,
    CocosPluginConfig,
    PluginVersion
} from '../declare';
import adaptation, { Adaptation } from './adaptation'

export class CocosCreatorPluginMain {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Adaptation: Adaptation = adaptation;
    public wrapper: PluginMainWrapper | null = null;
    public isV2: boolean = true;

    public init(config: CocosPluginConfig, wrapper: PluginMainWrapper) {
        this.isV2 = config.options.version === PluginVersion.v2;
        this.manifest = config.manifest;
        this.options = config.options;
        this.wrapper = wrapper;
        this.Adaptation.init(config, this.isV2)
    }
}

const CCP = new CocosCreatorPluginMain();
export default CCP;
