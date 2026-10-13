/* Seeds an admin, demo catalog, payment methods and settings. Usage: npm run seed  (needs MONGODB_URI in env) */
import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
loadEnvConfig(process.cwd()); // loads .env / .env.local like `next dev` does (tsx doesn't)
import bcrypt from 'bcryptjs';
import { Admin } from '../src/models/Admin';
import { Category, Subcategory, Skill, Charge, BadgeSetting } from '../src/models/Catalog';
import { PayMethod } from '../src/models/Finance';
import { Setting } from '../src/models/Misc';
import { Frontend, PageDoc } from '../src/models/Cms';
import cms from '../src/data/cms.json';

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI');
  await mongoose.connect(process.env.MONGODB_URI);
  const pw = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(pw, 10);
  await Admin.updateOne(
    { username: 'admin' },
    { $set: { name: 'Administrator', username: 'admin', email: 'haycoder24@gmail.com', password: passwordHash } },
    { upsert: true },
  );
  await Setting.updateOne({ key: 'general' }, { $setOnInsert: { key: 'general' } }, { upsert: true });

  // CMS content (home sections, FAQ, policies, contact, social icons…) exported from the original install's database.sql
  if (!(await Frontend.countDocuments())) await Frontend.insertMany(cms.frontends);
  for (const p of cms.pages) await PageDoc.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
  await Setting.updateOne({ key: 'general' }, { $set: { siteName: cms.settings.siteName } });

  const catalog: Record<string, string[]> = {
    'Web Development': ['Frontend', 'Backend', 'Full-stack'], 'Design': ['UI/UX', 'Logo & Branding'], 'Writing': ['Copywriting', 'Technical Writing'],
  };
  for (const [name, subs] of Object.entries(catalog)) {
    const c = await Category.findOneAndUpdate({ name }, { name, status: 1 }, { upsert: true, new: true });
    for (const s of subs) await Subcategory.updateOne({ category: c._id, name: s }, { category: c._id, name: s, status: 1 }, { upsert: true });
  }
  for (const s of ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Figma', 'SEO']) await Skill.updateOne({ name: s }, { name: s, status: 1 }, { upsert: true });
  if (!(await Charge.countDocuments())) await Charge.insertMany([{ amount: 1000, percent: 10 }, { amount: 10000, percent: 7 }, { amount: 1000000, percent: 5 }]);
  if (!(await BadgeSetting.countDocuments())) await BadgeSetting.insertMany([{ badgeName: 'Rising', minAmount: 0 }, { badgeName: 'Pro', minAmount: 1000 }, { badgeName: 'Top Rated', minAmount: 10000 }]);
  if (!(await PayMethod.countDocuments())) {
    await PayMethod.create({ kind: 'deposit', name: 'Bank transfer', minLimit: 10, maxLimit: 10000, fixedCharge: 0, percentCharge: 1, instruction: 'Transfer to the account below and enter the reference.', formFields: [{ label: 'Transaction reference', required: true }] });
    await PayMethod.create({ kind: 'withdraw', name: 'Bank transfer', minLimit: 10, maxLimit: 10000, fixedCharge: 1, percentCharge: 1, formFields: [{ label: 'Account name', required: true }, { label: 'Account number', required: true }] });
  }
  console.log('Seeded. Admin username: admin (password is set from ADMIN_PASSWORD)');
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
