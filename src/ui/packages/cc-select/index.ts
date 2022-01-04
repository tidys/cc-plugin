import { withInstall, WithInstallType } from '../utils/withInstall';
// @ts-ignore
import CCSelect from './index.vue';

export const Select: WithInstallType<typeof CCSelect> = withInstall(CCSelect)
export default Select;
