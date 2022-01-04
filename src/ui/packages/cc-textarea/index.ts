import { withInstall, WithInstallType } from '../utils/withInstall';
// @ts-ignore
import CCTextarea from './textarea.vue';

export const Textarea: WithInstallType<typeof CCTextarea> = withInstall(CCTextarea)
export default Textarea;
