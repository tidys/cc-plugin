import { withInstall, WithInstallType } from '../utils/withInstall';
// @ts-ignore
import CCProp from './index.vue';

export const Prop: WithInstallType<typeof CCProp> = withInstall(CCProp)
export default Prop;
