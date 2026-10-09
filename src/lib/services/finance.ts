import { Buyer } from '@/models/Buyer';
import { User } from '@/models/User';
import { Deposit, PayMethod, Withdrawal } from '@/models/Finance';
import { bad, makeTrx, money, notFound } from '../api';
import { S } from '../constants';
import { notify } from '../notify';
import { adjustBalance, debitOrThrow, recordTxn } from './wallet';
import type { Doc } from '@/models/_util';

type Field = { label?: string; key?: string; required?: boolean };
/** Validates user-submitted dynamic form values against a method's formFields (Laravel FormProcessor). */
export function validateForm(fields: Field[], info: Record<string, unknown> = {}) {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const k = f.key || f.label!; const v = String(info[k] ?? '').trim();
    if (f.required && !v) throw bad(`${f.label ?? k} is required`);
    if (v) out[f.label ?? k] = v;
  }
  return out;
}

export function quote(m: Doc, amount: number) {
  if (amount < m.minLimit) throw bad(`Amount is below the minimum (${m.minLimit})`);
  if (m.maxLimit && amount > m.maxLimit) throw bad(`Amount is above the maximum (${m.maxLimit})`);
  const charge = money(m.fixedCharge + (amount * m.percentCharge) / 100);
  return { charge, afterCharge: money(amount - charge), finalAmount: money((amount + charge) * m.rate) };
}

/** Buyer submits a manual deposit — goes to admin as PENDING. */
export async function createManualDeposit(buyerId: unknown, methodId: string, amount: number, info: Record<string, unknown>) {
  const m = await PayMethod.findOne({ _id: methodId, kind: 'deposit', status: 1 });
  if (!m) throw notFound('Payment method not found');
  const q = quote(m, amount);
  return Deposit.create({ buyer: buyerId, method: m._id, amount, charge: q.charge, rate: m.rate, currency: m.currency, finalAmount: q.finalAmount, trx: makeTrx(), status: S.PAYMENT.PENDING, detail: validateForm(m.formFields, info) });
}

/** Port of PaymentController::userDataUpdate — idempotent via the status transition. */
export async function approveDeposit(id: string, feedback?: string) {
  const d = await Deposit.findOneAndUpdate({ _id: id, status: { $in: [S.PAYMENT.INITIATE, S.PAYMENT.PENDING] } }, { status: S.PAYMENT.SUCCESS, adminFeedback: feedback }, { new: true }).populate('method', 'name');
  if (!d) throw notFound('Deposit not found or already processed');
  const b = await adjustBalance(Buyer, d.buyer, d.amount);
  await recordTxn({ buyer: d.buyer, amount: d.amount, charge: d.charge, postBalance: b!.balance, trxType: '+', details: `Deposit via ${d.method?.name}`, remark: 'deposit', trx: d.trx });
  await notify('buyer', d.buyer, 'Deposit approved', `${d.amount} was added to your balance.`);
}

export async function rejectDeposit(id: string, feedback?: string) {
  const d = await Deposit.findOneAndUpdate({ _id: id, status: S.PAYMENT.PENDING }, { status: S.PAYMENT.REJECT, adminFeedback: feedback }, { new: true });
  if (!d) throw notFound('Deposit not found or already processed');
  await notify('buyer', d.buyer, 'Deposit rejected', feedback ?? '');
}

/** Port of Withdraw*Controller (preview + submit collapsed). Balance is debited atomically up front. */
export async function requestWithdrawal(role: 'user' | 'buyer', acct: Doc, methodId: string, amount: number, info: Record<string, unknown>) {
  const m = await PayMethod.findOne({ _id: methodId, kind: 'withdraw', status: 1 });
  if (!m) throw notFound('Withdraw method not found');
  const { charge, afterCharge } = quote(m, amount); // also enforces min/max limits
  if (afterCharge <= 0) throw bad('Withdraw amount must be sufficient for charges');
  const data = validateForm(m.formFields, info);
  const upd = await debitOrThrow(role === 'user' ? User : Buyer, acct._id, amount, 'Insufficient balance for withdrawal');
  const trx = makeTrx();
  const w = await Withdrawal.create({ [role]: acct._id, method: m._id, amount, currency: m.currency, rate: m.rate, charge, afterCharge, finalAmount: money(afterCharge * m.rate), trx, status: S.PAYMENT.PENDING, info: data });
  await recordTxn({ [role]: acct._id, amount, charge, postBalance: upd.balance, trxType: '-', details: `Withdraw request via ${m.name}`, remark: 'withdraw', trx });
  await notify('admin', 'all', 'New withdraw request', `${acct.username} requested ${amount}`, '/admin/withdrawals');
  return w;
}

export async function approveWithdrawal(id: string, feedback?: string) {
  const w = await Withdrawal.findOneAndUpdate({ _id: id, status: S.PAYMENT.PENDING }, { status: S.PAYMENT.SUCCESS, adminFeedback: feedback }, { new: true });
  if (!w) throw notFound('Withdrawal not found or already processed');
  await notify(w.user ? 'user' : 'buyer', w.user ?? w.buyer, 'Withdrawal approved', feedback ?? '');
}

/** Rejection refunds the held amount (Admin\WithdrawalController@reject). */
export async function rejectWithdrawal(id: string, feedback?: string) {
  const w = await Withdrawal.findOneAndUpdate({ _id: id, status: S.PAYMENT.PENDING }, { status: S.PAYMENT.REJECT, adminFeedback: feedback }, { new: true });
  if (!w) throw notFound('Withdrawal not found or already processed');
  const role = w.user ? 'user' : 'buyer';
  const acct = await adjustBalance(w.user ? User : Buyer, w.user ?? w.buyer, w.amount);
  await recordTxn({ [role]: acct!._id, amount: w.amount, postBalance: acct!.balance, trxType: '+', details: 'Refunded for withdrawal rejection', remark: 'withdraw_reject', trx: w.trx });
  await notify(role, acct!._id, 'Withdrawal rejected', feedback ?? '');
}
