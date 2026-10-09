import { defineModel } from './_util';

export const Admin = defineModel('Admin', {
  name: String,
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
});
