import { z } from 'zod';
import { bad } from './api';
import { Category, Skill, Subcategory } from '@/models/Catalog';

export const jobSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  category: z.string(), subcategory: z.string(),
  description: z.string().min(10),
  budget: z.coerce.number().gt(0),
  customBudget: z.boolean().default(false),
  projectScope: z.coerce.number().int().min(1).max(3),
  jobLongevity: z.coerce.number().int().min(1).max(4),
  skillLevel: z.coerce.number().int().min(1).max(4),
  deadline: z.coerce.date(),
  questions: z.array(z.string()).max(5).default([]),
  skillIds: z.array(z.string()).min(1),
  status: z.union([z.literal(0), z.literal(1)]),
});

/** Validates category/subcategory/skills exist and are active (Laravel Rule::exists ... status=1). */
export async function validateJobRefs(d: z.infer<typeof jobSchema>) {
  const [c, s, k] = await Promise.all([
    Category.exists({ _id: d.category, status: 1 }), Subcategory.exists({ _id: d.subcategory, category: d.category, status: 1 }),
    Skill.countDocuments({ _id: { $in: d.skillIds } }),
  ]);
  if (!c) throw bad('Invalid category'); if (!s) throw bad('Invalid subcategory'); if (k !== d.skillIds.length) throw bad('Invalid skills');
}

