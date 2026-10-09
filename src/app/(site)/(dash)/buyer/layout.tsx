import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import DashShell from '@/components/DashShell';

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession();
  if (s?.role !== 'buyer') redirect('/buyer/login');
  return <DashShell role="buyer" title="Buyer Dashboard">{children}</DashShell>;
}
