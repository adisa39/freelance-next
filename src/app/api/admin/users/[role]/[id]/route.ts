import { z } from 'zod';
import { route, ok, bad, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { adjustBalance, recordTxn } from '@/lib/services/wallet';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';

/** POST {action:'ban'|'unban'|'balance', amount?, type?:'add'|'sub', remark?} */
export const POST = route(async (req, ctx) => {
  await requireUser('admin');
  const { role, id } = await ctx.params;
  if (role !== 'user' && role !== 'buyer') throw bad('Invalid role');
  const M = role === 'user' ? User : Buyer;
  const d = z.object({ action: z.enum(['ban', 'unban', 'balance']), amount: z.coerce.number().gt(0).optional(), type: z.enum(['add', 'sub']).optional(), remark: z.string().optional(), reason: z.string().optional() }).parse(await req.json());
  if (!(await M.exists({ _id: id }))) throw notFound('Account not found');
  if (d.action === 'ban') await M.updateOne({ _id: id }, { status: S.USER.BAN, banReason: d.reason });
  else if (d.action === 'unban') await M.updateOne({ _id: id }, { status: S.USER.ACTIVE, banReason: null });
  else {
    if (!d.amount || !d.type) throw bad('amount and type required');
    const delta = d.type === 'add' ? d.amount : -d.amount;
    const acct = await adjustBalance(M, id, delta);
    if (!acct) throw bad('Insufficient balance to subtract');
    await recordTxn({ [role]: id, amount: d.amount, postBalance: acct.balance, trxType: d.type === 'add' ? '+' : '-', details: d.remark || `Balance ${d.type === 'add' ? 'added' : 'subtracted'} by admin`, remark: 'balance_' + d.type });
  }
  return ok();
});
