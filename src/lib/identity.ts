import type { Types } from 'mongoose';
import { Identity } from '@/models/Identity';
import { User } from '@/models/User';
import { Client } from '@/models/Buyer';
import { Wallet } from '@/models/Wallet';
import type { Doc } from '@/models/_util';

export type MarketplaceRole = 'user' | 'buyer';
const profileField = (role: MarketplaceRole) => role === 'user' ? 'freelancerProfile' : 'clientProfile';
const Profile = (role: MarketplaceRole) => role === 'user' ? User : Client;

/** Find or create the shared identity for a legacy role profile and attach its existing wallet. */
export async function ensureIdentity(role: MarketplaceRole, profile: Doc, wallet?: Doc | null) {
  const field = profileField(role);
  const profileIdentity = await Identity.findOne({ [field]: profile._id });
  const walletIdentity = wallet?.identity_id ? await Identity.findById(wallet.identity_id) : null;
  if (profileIdentity && walletIdentity && String(profileIdentity._id) !== String(walletIdentity._id)) {
    throw new Error('The wallet and profile are linked to different account identities.');
  }
  let identity = profileIdentity ?? walletIdentity;
  if (!identity) {
    identity = await Identity.create({
      email: String(profile.email).toLowerCase(),
      firstname: profile.firstname,
      lastname: profile.lastname,
      roles: [role],
      [field]: profile._id,
    });
  } else {
    const currentProfile = identity.get(field) as Types.ObjectId | undefined;
    if (currentProfile && String(currentProfile) !== String(profile._id)) {
      throw new Error('This wallet is linked to a different account identity.');
    }
    identity.set(field, profile._id);
    identity.set('email', String(profile.email).toLowerCase());
    identity.set('firstname', profile.firstname);
    identity.set('lastname', profile.lastname);
    if (!identity.roles.includes(role)) identity.roles.push(role);
    await identity.save();
  }

  if (wallet && String(wallet.identity_id ?? '') !== String(identity._id)) {
    await Wallet.updateOne({ _id: wallet._id }, { $set: { identity_id: identity._id } });
  }
  return identity;
}

export async function getRoleProfile(identityId: string, role: MarketplaceRole) {
  const identity = await Identity.findById(identityId);
  const profileId = identity?.get(profileField(role));
  if (!profileId) return null;
  return Profile(role).findById(profileId);
}

export const identityProfileField = profileField;
export const profileModel = Profile;
