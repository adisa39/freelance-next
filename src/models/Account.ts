import { Schema } from 'mongoose';
// Fields shared by freelancer (User) and Buyer accounts — mirrors the `users` / `buyers` tables.
export const accountFields = {
  firstname: { type: String, trim: true },
  lastname: { type: String, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  dialCode: String,
  mobile: String,
  country: String,
  city: String,
  state: String,
  zip: String,
  address: String,
  balance: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  status: { type: Number, default: 1 },     // Status::USER_ACTIVE
  ev: { type: Number, default: 1 },         // email verified
  sv: { type: Number, default: 1 },         // sms verified
  kv: { type: Number, default: 0 },         // kyc status
  kycData: { type: Schema.Types.Mixed, select: false },
  profileComplete: { type: Boolean, default: false },
  verCode: { type: String, select: false },
  verCodeSendAt: Date,
  banReason: String,
  image: String,
  countryName: String,
  countryCode: String,
  step: { type: Number, default: 0 },
};
