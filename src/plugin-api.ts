import CocosPluginService from './service';
import { PluginMgr } from './plugin-mgr';

export abstract class PluginApi {
    abstract apply(api: PluginMgr, service: CocosPluginService): void;
}
