import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import DashShell from '@/components/DashShell';

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession();
  if (s?.role !== 'buyer') redirect('/client/login');
  return <DashShell role="buyer" title="Client Dashboard">{children}</DashShell>;
}
