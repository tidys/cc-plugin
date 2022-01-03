import { withInstall, WithInstallType } from '../utils/withInstall';
// @ts-ignore
import CCInput from './index.vue';

export const Input: WithInstallType<typeof CCInput> = withInstall(CCInput)
export default Input;
