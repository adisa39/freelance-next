import { Setting } from '@/models/Misc';

/** Returns the singleton settings document (created on first use). */
export async function getSettings() {
  return Setting.findOneAndUpdate({ key: 'general' }, { $setOnInsert: { key: 'general' } }, { upsert: true, new: true }).lean();
}
