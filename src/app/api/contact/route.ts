import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { ContactMessage } from '@/models/Cms';
import { notify } from '@/lib/notify';

export const POST = route(async (req) => {
  const d = z.object({ name: z.string().min(1), email: z.email(), subject: z.string().min(1), message: z.string().min(1) }).parse(await req.json());
  await ContactMessage.create(d);
  await notify('admin', 'all', 'New contact message', d.subject);
  return ok();
});
