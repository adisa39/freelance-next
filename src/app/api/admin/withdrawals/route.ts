import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Withdrawal } from '@/models/Finance';

export const GET = route(async (req) => {
  await requireUser('admin');
  const status = new URL(req.url).searchParams.get('status');
  return ok(await paginate(req, Withdrawal, status ? { status: Number(status) } : {}, { populate: [{ path: 'user', select: 'username' }, { path: 'buyer', select: 'username' }, { path: 'method', select: 'name' }] }));
});
