import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import DashShell from '@/components/DashShell';

export default async function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession();
  if (s?.role !== 'user') redirect('/freelancer/login');
  return <DashShell role="user" title="Freelancer Dashboard">{children}</DashShell>;
}
