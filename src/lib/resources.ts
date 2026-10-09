import { z } from 'zod';
import type { Model } from 'mongoose';
import type { Doc } from '@/models/_util';
import { Category, Subcategory, Skill, Charge, BadgeSetting } from '@/models/Catalog';
import { PayMethod } from '@/models/Finance';

const field = z.object({ label: z.string(), key: z.string().optional(), type: z.string().default('text'), required: z.boolean().default(true) });
const methodBase = { name: z.string().min(1), currency: z.string().default('USD'), rate: z.coerce.number().gt(0).default(1), minLimit: z.coerce.number().min(0).default(0), maxLimit: z.coerce.number().min(0).default(0), fixedCharge: z.coerce.number().min(0).default(0), percentCharge: z.coerce.number().min(0).default(0), instruction: z.string().optional(), formFields: z.array(field).default([]), status: z.coerce.number().default(1) };

type Res = { model: Model<Doc>; schema: z.ZodObject; filter?: Record<string, unknown>; fixed?: Record<string, unknown> };
export const RESOURCES: Record<string, Res> = {
  categories: { model: Category, schema: z.object({ name: z.string().min(1), status: z.coerce.number().default(1) }) },
  subcategories: { model: Subcategory, schema: z.object({ category: z.string(), name: z.string().min(1), status: z.coerce.number().default(1) }) },
  skills: { model: Skill, schema: z.object({ name: z.string().min(1), status: z.coerce.number().default(1) }) },
  charges: { model: Charge, schema: z.object({ amount: z.coerce.number().min(0), percent: z.coerce.number().min(0).max(100) }) },
  badges: { model: BadgeSetting, schema: z.object({ badgeName: z.string().min(1), minAmount: z.coerce.number().min(0) }) },
  'deposit-methods': { model: PayMethod, schema: z.object(methodBase), filter: { kind: 'deposit' }, fixed: { kind: 'deposit' } },
  'withdraw-methods': { model: PayMethod, schema: z.object(methodBase), filter: { kind: 'withdraw' }, fixed: { kind: 'withdraw' } },
};
