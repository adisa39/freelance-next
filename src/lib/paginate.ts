import type { Model, PopulateOptions, SortOrder } from 'mongoose';
import type { Doc } from '@/models/_util';
import { pageParams } from './api';

export async function paginate(
  req: Request, model: Model<Doc>, filter: Record<string, unknown>,
  opts: { sort?: Record<string, SortOrder>; populate?: (string | PopulateOptions)[]; size?: number; select?: string } = {},
) {
  const { page, size, skip } = pageParams(req, opts.size);
  const [total, items] = await Promise.all([
    model.countDocuments(filter),
    model.find(filter, opts.select).sort(opts.sort ?? { createdAt: -1 }).skip(skip).limit(size).populate(opts.populate ?? []).lean(),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / size)) };
}
