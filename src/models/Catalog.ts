import { defineModel, oid } from './_util';

export const Category = defineModel('Category', { name: { type: String, required: true }, image: String, isFeatured: { type: Boolean, default: false }, status: { type: Number, default: 1 } });
export const Subcategory = defineModel('Subcategory', { category: oid('Category', true), name: { type: String, required: true }, status: { type: Number, default: 1 } });
export const Skill = defineModel('Skill', { name: { type: String, required: true, unique: true }, status: { type: Number, default: 1 } });
/** Service-charge tiers: first tier where freelancer.earning <= amount applies `percent`. */
export const Charge = defineModel('Charge', { level: String, amount: Number, percent: Number });
/** Freelancer badge by lifetime earning (Laravel BadgeSetting + User::updateBadge). */
export const BadgeSetting = defineModel('BadgeSetting', { badgeName: String, image: String, minAmount: { type: Number, default: 0 } });
