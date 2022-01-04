import { withInstall, WithInstallType } from '../utils/withInstall';
// @ts-ignore
import CCInput from './input.vue';

export const Input: WithInstallType<typeof CCInput> = withInstall(CCInput)
export default Input;
