import { route, ok } from '@/lib/api';
import { readSession } from '@/lib/auth';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { Admin } from '@/models/Admin';
import { Identity } from '@/models/Identity';

export const GET = route(async () => {
  const s = await readSession();
  if (!s) return ok(null);
  const M = s.role === 'user' ? User : s.role === 'buyer' ? Buyer : Admin;
  const acct = await M.findById(s.id).lean();
  if (!acct) return ok(null);
  const identity = s.identityId ? await Identity.findById(s.identityId).select('roles').lean() : null;
  const publicRole = s.role === 'buyer' ? 'client' : s.role;
  const roles = (identity?.roles ?? [s.role]).map((role: string) => role === 'buyer' ? 'client' : role);
  return ok({ role: publicRole, roles, id: acct._id, name: acct.name ?? `${acct.firstname ?? ''} ${acct.lastname ?? ''}`.trim(), username: acct.username, balance: acct.balance, avgRating: acct.avgRating, workProfileComplete: acct.workProfileComplete });
});
