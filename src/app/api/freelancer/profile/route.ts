import { z } from 'zod';
import { route, ok, bad } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { User } from '@/models/User';
import { Skill } from '@/models/Catalog';

export const GET = route(async () => {
  const u = await requireUser('user');
  return ok(await User.findById(u._id).populate({ path: 'skillIds', select: 'name' }).lean());
});

const schema = z.object({
  firstname: z.string().min(1), lastname: z.string().min(1),
  tagline: z.string().max(120).optional(), about: z.string().max(5000).optional(),
  country: z.string().optional(), city: z.string().optional(), address: z.string().optional(), mobile: z.string().optional(),
  skillIds: z.array(z.string()).default([]),
  educations: z.array(z.object({ school: z.string(), degree: z.string().optional(), areaOfStudy: z.string().optional(), yearFrom: z.string().optional(), yearTo: z.string().optional(), description: z.string().optional() })).default([]),
  portfolios: z.array(z.object({ title: z.string(), role: z.string().optional(), description: z.string().optional(), skillIds: z.array(z.string()).default([]) })).default([]),
});

/** Replaces the work profile; sets workProfileComplete once headline + bio + a skill exist (gate for bidding). */
export const PUT = route(async (req) => {
  const u = await requireUser('user');
  const d = schema.parse(await req.json());
  if (d.skillIds.length && (await Skill.countDocuments({ _id: { $in: d.skillIds } })) !== d.skillIds.length) throw bad('Invalid skills');
  u.set({ ...d, workProfileComplete: Boolean(d.tagline && d.about && d.skillIds.length) });
  await u.save();
  return ok({ workProfileComplete: u.workProfileComplete });
});
