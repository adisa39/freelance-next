'use client';
import { use } from 'react';
import BidsTable from '@/components/BidsTable';
export default function JobBids({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <><h1 className="text-2xl font-bold">Bids for this job</h1><BidsTable jobId={id} /></>; }
