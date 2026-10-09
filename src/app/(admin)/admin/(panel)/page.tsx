'use client';
import { fmtMoney, useApi } from '@/lib/client';
import { Loading, Stat } from '@/components/ui';

export default function Dashboard() {
  const { data: d } = useApi<any>('/api/admin/dashboard'); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!d) return <Loading />;
  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Freelancers" value={d.freelancers} /><Stat label="Clients" value={d.buyers} /><Stat label="Jobs awaiting approval" value={d.jobsPending} /><Stat label="Reported projects" value={d.reportedProjects} />
        <Stat label="Pending deposits" value={d.depositsPending} /><Stat label="Pending withdrawals" value={d.withdrawalsPending} /><Stat label="Open tickets" value={d.openTickets} /><Stat label="Total deposited" value={fmtMoney(d.totalDeposited)} />
      </div>
    </>
  );
}
