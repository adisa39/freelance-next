import { z } from 'zod';
import { route, ok, bad } from '@/lib/api';
import { hash, startSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';

const schema = z.object({
  role: z.enum(['user', 'buyer']),
  firstname: z.string().min(1), lastname: z.string().min(1),
  username: z.string().min(6, 'Username must be at least 6 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and _ only').optional(),
  email: z.email(), password: z.string().min(6), password_confirmation: z.string().optional(),
  country: z.string().optional(), mobile: z.string().optional(),
});

export const POST = route(async (req) => {
  const d = schema.parse(await req.json());
  const cfg = await getSettings();
  if (d.role === 'user' && !cfg.registration) throw bad('Registration is disabled');
  if (d.role === 'buyer' && !cfg.buyerRegistration) throw bad('Buyer registration is disabled');
  if (d.password_confirmation !== undefined && d.password_confirmation !== d.password) throw bad('Password confirmation does not match');
  const Model = d.role === 'user' ? User : Buyer;
  // Laravel derives the username from the email local part when none is given
  const base = (d.username ?? d.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '').padEnd(6, '0');
  let username = base; for (let i = 0; !d.username && (await Model.exists({ username })); i++) username = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
  const exists = await Model.findOne({ $or: [{ email: d.email.toLowerCase() }, { username }] });
  if (exists) throw bad('Email or username already in use');
  const { role, password, password_confirmation: _pc, username: _u, ...rest } = d; void _pc; void _u;
  const acct = await Model.create({ ...rest, username, password: await hash(password) });
  await startSession(String(acct._id), role);
  return ok({ id: acct._id, role }, 201);
});
