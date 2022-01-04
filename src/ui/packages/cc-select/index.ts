import { withInstall, WithInstallType } from '../utils/withInstall';
// @ts-ignore
import CCSelect from './select.vue';

export const Select: WithInstallType<typeof CCSelect> = withInstall(CCSelect)
export default Select;
