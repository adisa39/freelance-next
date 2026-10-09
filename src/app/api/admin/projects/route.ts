import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Project } from '@/models/Marketplace';

export const GET = route(async (req) => {
  await requireUser('admin');
  const status = new URL(req.url).searchParams.get('status');
  return ok(await paginate(req, Project, status ? { status: Number(status) } : {}, { populate: [{ path: 'job', select: 'title' }, { path: 'user', select: 'username' }, { path: 'buyer', select: 'username' }, { path: 'bid', select: 'bidAmount' }] }));
});
