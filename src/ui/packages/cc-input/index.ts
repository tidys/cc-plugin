import { withInstall, WithInstallType } from '../utils/withInstall';
import CCInput from './index.vue';

export const Input: WithInstallType<typeof CCInput> = withInstall(CCInput)
export default Input;
