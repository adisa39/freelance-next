'use client';
import { use } from 'react';
import JobForm from '@/components/JobForm';
export default function EditJob({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <><h1 className="text-2xl font-bold">Edit job</h1><JobForm jobId={id} /></>; }
