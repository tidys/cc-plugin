import { withInstall, WithInstallType } from '../utils/withInstall';
import CCSection from './section.vue';

export const Section: WithInstallType<typeof CCSection> = withInstall(CCSection)
export default Section;
