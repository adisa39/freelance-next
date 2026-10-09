import { defineModel } from './_util';
import { accountFields } from './Account';

/** Client / employer who posts jobs (Laravel `buyers`). */
export const Buyer = defineModel('Buyer', { ...accountFields, company: String });
