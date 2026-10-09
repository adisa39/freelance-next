import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth';
import Shell from '@/components/Shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await readSession();
  if (s?.role !== 'admin') redirect('/admin/login');
  return (
    <Shell title="Freelance · Admin" nav={[
      { href: '/admin', label: 'Dashboard' }, { href: '/admin/jobs', label: 'Jobs' }, { href: '/admin/projects', label: 'Projects' }, { href: '/admin/deposits', label: 'Deposits' },
      { href: '/admin/withdrawals', label: 'Withdrawals' }, { href: '/admin/users', label: 'Users' }, { href: '/admin/tickets', label: 'Tickets' }, { href: '/admin/settings', label: 'Settings' },
    ]}>{children}</Shell>
  );
}
