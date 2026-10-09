import { route, ok, notFound } from '@/lib/api';
import { biddersFor } from '@/lib/public-data';
import { Job } from '@/models/Marketplace';

export const GET = route(async (req, ctx) => {
  const { slug } = await ctx.params;
  const job = await Job.findOne({ slug }).select('_id');
  if (!job) throw notFound();
  const sp = new URL(req.url).searchParams;
  const offset = Number(sp.get('offset') ?? 5), limit = Number(sp.get('limit') ?? 5);
  const items = await biddersFor(String(job._id), offset, limit);
  return ok({ items, nextOffset: items.length < limit ? null : offset + limit });
});
