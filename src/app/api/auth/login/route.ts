import { z } from 'zod';
import { route, ok, ApiError } from '@/lib/api';
import { compare, startSession } from '@/lib/auth';
import { Admin } from '@/models/Admin';

const schema = z.object({ role: z.enum(['user', 'buyer', 'admin']), login: z.string().trim().min(1), password: z.string().min(1) });

export const POST = route(async (req) => {
  const { role, login, password } = schema.parse(await req.json());
  if (role !== 'admin') throw new ApiError(410, 'Freelancer and buyer accounts sign in with an InterLink wallet.');
  const normalizedLogin = login.toLowerCase();
  const acct = await Admin.findOne({ $or: [{ email: normalizedLogin }, { username: normalizedLogin }] }).select('+password');
  if (!acct || !(await compare(password, acct.password))) throw new ApiError(401, 'Invalid credentials');
  await startSession(String(acct._id), role);
  return ok({ id: acct._id, role });
});
