import { route, ok, bad, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { RESOURCES } from '@/lib/resources';

export const PUT = route(async (req, ctx) => {
  await requireUser('admin');
  const { name, id } = await ctx.params;
  const r = RESOURCES[name]; if (!r) throw bad('Unknown resource');
  const doc = await r.model.findByIdAndUpdate(id, r.schema.partial().parse(await req.json()), { new: true });
  if (!doc) throw notFound(); return ok(doc);
});

export const DELETE = route(async (_req, ctx) => {
  await requireUser('admin');
  const { name, id } = await ctx.params;
  const r = RESOURCES[name]; if (!r) throw bad('Unknown resource');
  await r.model.findByIdAndDelete(id); return ok();
});
