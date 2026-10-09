import { route, ok } from '@/lib/api';
import { readSession } from '@/lib/auth';
import { Notification } from '@/models/Misc';

export const GET = route(async () => {
  const s = await readSession();
  if (!s) return ok([]);
  const rcpt = s.role === 'admin' ? { $in: [s.id, 'all'] } : s.id;
  return ok(await Notification.find({ recipientRole: s.role, recipient: rcpt }).sort({ createdAt: -1 }).limit(30).lean());
});

export const POST = route(async () => { // mark all read
  const s = await readSession();
  if (s) await Notification.updateMany({ recipientRole: s.role, recipient: s.role === 'admin' ? { $in: [s.id, 'all'] } : s.id }, { read: true });
  return ok();
});
