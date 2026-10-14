import { defineModel, oid } from './_util';

/** A person may hold both role profiles. Legacy profile collections remain the source of role-specific data. */
export const Identity = defineModel('Identity', {
  email: { type: String, required: true, lowercase: true, trim: true },
  firstname: { type: String, trim: true },
  lastname: { type: String, trim: true },
  roles: { type: [String], enum: ['user', 'buyer'], default: [] },
  freelancerProfile: oid('User'),
  clientProfile: oid('Buyer'),
}, {}, (schema) => {
  schema.index({ freelancerProfile: 1 }, { unique: true, sparse: true });
  schema.index({ clientProfile: 1 }, { unique: true, sparse: true });
});
