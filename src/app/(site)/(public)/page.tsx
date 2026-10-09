import { Banner, HowWork, Account, WhyChoose, FindTask, Facility, CompletionWork, TopFreelancer, Subscribe, Faq } from '@/components/site/sections';

export default async function Home() {
  // Section order as rendered on http://bf-blessy.com/
  return (<><Banner /><HowWork /><Account /><WhyChoose /><FindTask /><Facility /><CompletionWork /><TopFreelancer /><Subscribe /><Faq /></>);
}
