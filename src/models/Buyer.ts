import { defineModel } from './_util';
import { accountFields } from './Account';

/** Client profile. Keep the legacy Buyer collection/model name for existing data and references. */
export const Client = defineModel('Buyer', { ...accountFields, company: String });
export const Buyer = Client;
