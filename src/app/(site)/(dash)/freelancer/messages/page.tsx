'use client';
import { Suspense } from 'react';
import Messages from '@/components/Messages';
export default function Page() { return <><h1 className="text-2xl font-bold">Messages</h1><Suspense><Messages role="user" /></Suspense></>; }
