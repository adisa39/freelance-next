import { Schema } from 'mongoose';
import { defineModel } from './_util';

/** A wallet belongs to one marketplace account, while an account may link many wallets. */
export const Wallet = defineModel('Wallet', {
  account_id: { type: Schema.Types.ObjectId, required: true },
  account_role: { type: String, enum: ['user', 'buyer'], required: true },
  identity_id: { type: Schema.Types.ObjectId, ref: 'Identity' },
  address: { type: String, required: true, lowercase: true, trim: true },
  chain_id: { type: Number, required: true },
  provider: { type: String, enum: ['interlink'], default: 'interlink' },
  is_primary: { type: Boolean, default: true },
}, {}, (schema) => {
  schema.index({ address: 1, chain_id: 1 }, { unique: true });
  schema.index({ account_id: 1, account_role: 1 });
});
