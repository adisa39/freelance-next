'use client';
import Link from 'next/link';
import { fmtMoney, useApi } from '@/lib/client';
import { Loading, Stat } from '@/components/ui';

export default function Dashboard() {
  const { data: d } = useApi<any>('/api/buyer/dashboard'); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!d) return <Loading />;
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Dashboard</h1><Link href="/buyer/jobs/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Post a job</Link></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Balance" value={fmtMoney(d.balance)} /><Stat label="Jobs posted" value={d.jobs} /><Stat label="Published" value={d.published} />
        <Stat label="Pending bids" value={d.pendingBids} /><Stat label="Active projects" value={d.runningProjects} /><Stat label="Completed" value={d.completedProjects} />
      </div>
    </>
  );
}
