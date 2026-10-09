import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Project } from '@/models/Marketplace';

export const GET = route(async (req) => {
  const u = await requireUser('user');
  const status = new URL(req.url).searchParams.get('status');
  return ok(await paginate(req, Project, { user: u._id, ...(status ? { status: Number(status) } : {}) }, { populate: [{ path: 'job', select: 'title slug' }, { path: 'buyer', select: 'username firstname lastname' }, { path: 'bid', select: 'bidAmount' }] }));
});
