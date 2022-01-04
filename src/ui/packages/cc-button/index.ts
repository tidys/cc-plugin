import { withInstall, WithInstallType } from '../utils/withInstall';
import CCButton from './button.vue';

export const Button: WithInstallType<typeof CCButton> = withInstall(CCButton)
export default Button;
