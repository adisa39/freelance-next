import { route, ok } from '@/lib/api';
import { requireParty } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Transaction, Deposit, Withdrawal } from '@/models/Finance';

/** ?type=transactions (default) | deposits | withdrawals */
export const GET = route(async (req) => {
  const { role, acct } = await requireParty();
  const type = new URL(req.url).searchParams.get('type') ?? 'transactions';
  const owner = { [role]: acct._id };
  const model = type === 'deposits' ? Deposit : type === 'withdrawals' ? Withdrawal : Transaction;
  const filter = type === 'deposits' ? { buyer: acct._id } : owner;
  const res = await paginate(req, model, filter, { populate: type === 'transactions' ? [] : [{ path: 'method', select: 'name' }] });
  return ok({ balance: acct.balance, ...res });
});
