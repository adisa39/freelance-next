import { defineModel } from './_util';

/** Laravel `frontends` — one document per CMS content/element row. */
export const Frontend = defineModel('Frontend', {
  id: { type: Number, index: true },       // keeps original ordering (Laravel `orderBy id`)
  dataKeys: { type: String, index: true },
  dataValues: { type: Object, default: {} },
  tempname: String,
  slug: String,
});
export const PageDoc = defineModel('Page', { name: String, slug: { type: String, unique: true }, secs: [String], isDefault: { type: Number, default: 0 } });
export const Subscriber = defineModel('Subscriber', { email: { type: String, unique: true, lowercase: true } });
export const ContactMessage = defineModel('ContactMessage', { name: String, email: String, subject: String, message: String });
