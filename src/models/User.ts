import { defineModel, oid } from './_util';
import { accountFields } from './Account';

/** Freelancer (Laravel `users` + `education` + `portfolios` + `skill_user`, embedded for Mongo). Field names follow the real schema. */
export const User = defineModel('User', {
  ...accountFields,
  tagline: String,        // headline shown on cards ("Backend Developer")
  about: String,
  image: String,
  earning: { type: Number, default: 0 },
  skillIds: [oid('Skill')],
  badge: oid('BadgeSetting'),
  workProfileComplete: { type: Boolean, default: false },
  educations: [{ school: String, degree: String, areaOfStudy: String, yearFrom: String, yearTo: String, description: String }],
  portfolios: [{ title: String, role: String, description: String, image: String, skillIds: [oid('Skill')], status: { type: Number, default: 1 } }],
});
