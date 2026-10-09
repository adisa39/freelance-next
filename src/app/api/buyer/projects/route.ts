import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Project } from '@/models/Marketplace';

export const GET = route(async (req) => {
  const b = await requireUser('buyer');
  const status = new URL(req.url).searchParams.get('status');
  return ok(await paginate(req, Project, { buyer: b._id, ...(status ? { status: Number(status) } : {}) }, { populate: [{ path: 'job', select: 'title slug' }, { path: 'user', select: 'username firstname lastname' }, { path: 'bid', select: 'bidAmount' }] }));
});
