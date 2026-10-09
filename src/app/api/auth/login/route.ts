import { z } from 'zod';
import { route, ok, ApiError } from '@/lib/api';
import { compare, startSession } from '@/lib/auth';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { Admin } from '@/models/Admin';
import { S } from '@/lib/constants';

const schema = z.object({ role: z.enum(['user', 'buyer', 'admin']), login: z.string().min(1), password: z.string().min(1) });

export const POST = route(async (req) => {
  const { role, login, password } = schema.parse(await req.json());
  const Model = role === 'user' ? User : role === 'buyer' ? Buyer : Admin;
  const l = login.toLowerCase().trim();
  const acct = await Model.findOne({ $or: [{ email: l }, { username: l }] }).select('+password');
  if (!acct || !(await compare(password, acct.password))) throw new ApiError(401, 'Invalid credentials');
  if (role !== 'admin' && acct.status === S.USER.BAN) throw new ApiError(403, 'Your account has been banned');
  await startSession(String(acct._id), role);
  return ok({ id: acct._id, role });
});
