import Breadcrumb from '@/components/site/Breadcrumb';
import JobsExplorer from '@/components/site/JobsExplorer';
import PageCss from '@/components/site/PageCss';

export const metadata = { title: 'Freelance Job' };
export default async function FreelanceJobs({ searchParams }: { searchParams: Promise<{ search?: string; category_id?: string }> }) {
  const sp = await searchParams;
  return (<><PageCss name="job_explore__jobs" /><Breadcrumb title="Freelance Job" /><JobsExplorer initialSearch={sp.search ?? ''} initialCategory={sp.category_id ?? ''} /></>);
}
