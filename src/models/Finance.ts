import { defineModel, oid } from './_util';

/** Manual deposit gateway or withdraw method. Replaces Laravel gateways/gateway_currencies/withdraw_methods + Form. */
export const PayMethod = defineModel('PayMethod', {
  kind: { type: String, enum: ['deposit', 'withdraw'], required: true },
  name: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  rate: { type: Number, default: 1 },
  minLimit: { type: Number, default: 0 },
  maxLimit: { type: Number, default: 0 },
  fixedCharge: { type: Number, default: 0 },
  percentCharge: { type: Number, default: 0 },
  instruction: String,
  // Dynamic form the payer fills in (replaces the Laravel `forms` table)
  formFields: [{ label: String, key: String, type: { type: String, default: 'text' }, required: { type: Boolean, default: true } }],
  status: { type: Number, default: 1 },
});

export const Transaction = defineModel('Transaction', {
  user: oid('User'), buyer: oid('Buyer'), project: oid('Project'),
  amount: Number, charge: { type: Number, default: 0 }, postBalance: Number,
  trxType: { type: String, enum: ['+', '-'] }, details: String, trx: String, remark: String,
}, {}, (s) => { s.index({ user: 1, createdAt: -1 }); s.index({ buyer: 1, createdAt: -1 }); });

export const Deposit = defineModel('Deposit', {
  buyer: oid('Buyer', true), method: oid('PayMethod', true),
  amount: Number, charge: Number, rate: Number, currency: String, finalAmount: Number,
  trx: { type: String, unique: true },
  status: { type: Number, default: 0 },  // S.PAYMENT
  detail: Object, adminFeedback: String,
});

export const Withdrawal = defineModel('Withdrawal', {
  user: oid('User'), buyer: oid('Buyer'), method: oid('PayMethod', true),
  amount: Number, currency: String, rate: Number, charge: Number, afterCharge: Number, finalAmount: Number,
  trx: { type: String, unique: true },
  status: { type: Number, default: 2 },
  info: Object, adminFeedback: String,
});
