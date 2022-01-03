import { withInstall, WithInstallType } from '../utils/withInstall';
import CCSection from './index.vue';

export const Section: WithInstallType<typeof CCSection> = withInstall(CCSection)
export default Section;
