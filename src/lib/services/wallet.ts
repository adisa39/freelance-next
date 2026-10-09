import type { Model } from 'mongoose';
import { Transaction } from '@/models/Finance';
import { makeTrx, money, ApiError } from '../api';
import type { Doc } from '@/models/_util';

/** Atomic balance change. For debits, fails (returns null) instead of going negative. Replaces `$user->balance -= x; $user->save()`. */
export async function adjustBalance(model: Model<Doc>, id: unknown, delta: number, extra: Record<string, number> = {}) {
  const filter: Record<string, unknown> = { _id: id };
  if (delta < 0) filter.balance = { $gte: -delta };
  return model.findOneAndUpdate(filter, { $inc: { balance: delta, ...extra } }, { new: true });
}

export async function debitOrThrow(model: Model<Doc>, id: unknown, amount: number, msg = 'Insufficient balance') {
  const d = await adjustBalance(model, id, -money(amount));
  if (!d) throw new ApiError(402, msg);
  return d;
}

type Owner = { user?: unknown; buyer?: unknown; project?: unknown };
export function recordTxn(o: Owner & { amount: number; postBalance: number; trxType: '+' | '-'; details: string; remark: string; trx?: string; charge?: number }) {
  return Transaction.create({ ...o, trx: o.trx ?? makeTrx(), charge: o.charge ?? 0 });
}
