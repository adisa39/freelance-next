'use client';
import { fmtMoney, useApi } from '@/lib/client';
import { Loading, Stat } from '@/components/ui';

export default function Dashboard() {
  const { data: d } = useApi<any>('/api/freelancer/dashboard'); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!d) return <Loading />;
  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Balance" value={fmtMoney(d.balance)} /><Stat label="Lifetime earnings" value={fmtMoney(d.earning)} /><Stat label="Rating" value={`★ ${d.avgRating?.toFixed(1)}`} />
        <Stat label="Pending bids" value={d.pendingBids} /><Stat label="Active projects" value={d.runningProjects} /><Stat label="Completed" value={d.completedProjects} />
      </div>
    </>
  );
}
