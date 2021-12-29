import { PluginMainWrapper, CocosPluginManifest, CocosPluginOptions } from '../declare';
import { Panel } from './panel'

export class CocosCreatorPlugin {
    public manifest: CocosPluginManifest | null = null;
    public options: CocosPluginOptions | null = null;
    public Panel: Panel | null = null;
    public wrapper: PluginMainWrapper | null = null;

    public init(manifest: CocosPluginManifest, options: CocosPluginOptions, wrapper: PluginMainWrapper) {
        this.manifest = manifest;
        this.options = options;
        this.wrapper = wrapper;
        this.Panel = new Panel(this);
    }
}

const CCP = new CocosCreatorPlugin();
export default CCP;
