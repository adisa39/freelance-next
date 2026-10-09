import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Deposit } from '@/models/Finance';

export const GET = route(async (req) => {
  await requireUser('admin');
  const status = new URL(req.url).searchParams.get('status');
  return ok(await paginate(req, Deposit, status ? { status: Number(status) } : {}, { populate: [{ path: 'buyer', select: 'username' }, { path: 'method', select: 'name' }] }));
});
