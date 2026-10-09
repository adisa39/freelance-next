import { route, ok } from '@/lib/api';
import { Category, Skill, Subcategory } from '@/models/Catalog';

export const GET = route(async () => {
  const [categories, subcategories, skills] = await Promise.all([
    Category.find({ status: 1 }).sort({ name: 1 }).lean(),
    Subcategory.find({ status: 1 }).sort({ name: 1 }).lean(),
    Skill.find({ status: 1 }).sort({ name: 1 }).lean(),
  ]);
  return ok({ categories, subcategories, skills });
});
