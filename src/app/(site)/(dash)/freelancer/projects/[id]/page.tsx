'use client';
import { use } from 'react';
import ProjectView from '@/components/ProjectView';
export default function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <><h1 className="text-2xl font-bold">Project</h1><ProjectView id={id} role="user" /></>; }
