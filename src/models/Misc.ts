import { defineModel } from './_util';

export const SupportTicket = defineModel('SupportTicket', {
  ownerRole: { type: String, enum: ['user', 'buyer'], required: true },
  owner: { type: String, required: true },
  ticket: { type: String, unique: true },
  subject: String,
  priority: { type: Number, default: 2 },
  status: { type: Number, default: 0 },    // S.TICKET
  messages: [{ senderRole: String, message: String, createdAt: { type: Date, default: Date.now } }],
}, {}, (s) => s.index({ ownerRole: 1, owner: 1 }));

export const Notification = defineModel('Notification', {
  recipientRole: { type: String, enum: ['user', 'buyer', 'admin'] },
  recipient: String,
  title: String, body: String, url: String,
  read: { type: Boolean, default: false },
}, {}, (s) => s.index({ recipientRole: 1, recipient: 1, createdAt: -1 }));

/** Singleton (key='general') — the Laravel `general_settings` keys that business logic actually reads. */
export const Setting = defineModel('Setting', {
  key: { type: String, unique: true, default: 'general' },
  siteName: { type: String, default: 'Freelance' },
  curText: { type: String, default: 'USD' },
  curSym: { type: String, default: '$' },
  escrowPayment: { type: Boolean, default: true },
  percentServiceCharge: { type: Boolean, default: true },
  fixedServiceCharge: { type: Number, default: 0 },
  jobAutoApproved: { type: Boolean, default: false },
  registration: { type: Boolean, default: true },
  buyerRegistration: { type: Boolean, default: true },
});
