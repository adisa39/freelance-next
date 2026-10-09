import { route, ok, escapeRegex } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { paginate } from '@/lib/paginate';
import { Job } from '@/models/Marketplace';

/** ?scope=pending|approved|rejected|published|drafted|processing|completed */
export const GET = route(async (req) => {
  await requireUser('admin');
  const sp = new URL(req.url).searchParams;
  const f: Record<string, unknown> = {};
  switch (sp.get('scope')) {
    case 'pending': f.status = S.JOB.PUBLISH; f.isApproved = S.JOB_APPROVAL.PENDING; break;
    case 'approved': f.isApproved = S.JOB_APPROVAL.APPROVED; break;
    case 'rejected': f.isApproved = S.JOB_APPROVAL.REJECTED; break;
    case 'published': f.status = S.JOB.PUBLISH; break;
    case 'drafted': f.status = S.JOB.DRAFT; break;
    case 'processing': f.status = S.JOB.PROCESSING; break;
    case 'completed': f.status = S.JOB.COMPLETED; break;
  }
  if (sp.get('q')) f.title = { $regex: escapeRegex(sp.get('q')!), $options: 'i' };
  return ok(await paginate(req, Job, f, { populate: [{ path: 'buyer', select: 'username' }, { path: 'category', select: 'name' }] }));
});
