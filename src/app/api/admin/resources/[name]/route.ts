import { route, ok, bad } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { RESOURCES } from '@/lib/resources';

/** Generic admin CRUD for catalog-style collections: categories, subcategories, skills, charges, badges, methods. */
export const GET = route(async (req, ctx) => {
  await requireUser('admin');
  const r = RESOURCES[(await ctx.params).name]; if (!r) throw bad('Unknown resource');
  return ok(await r.model.find(r.filter ?? {}).sort({ createdAt: -1 }).lean());
});

export const POST = route(async (req, ctx) => {
  await requireUser('admin');
  const r = RESOURCES[(await ctx.params).name]; if (!r) throw bad('Unknown resource');
  return ok(await r.model.create({ ...r.schema.parse(await req.json()), ...(r.fixed ?? {}) }), 201);
});
