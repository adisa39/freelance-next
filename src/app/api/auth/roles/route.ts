import { z } from 'zod';
import { route, ok, ApiError } from '@/lib/api';
import { readSession, startSession } from '@/lib/auth';
import { ensureIdentity, identityProfileField, profileModel, type MarketplaceRole } from '@/lib/identity';
import { Identity } from '@/models/Identity';
import { Wallet } from '@/models/Wallet';
import { getSettings } from '@/lib/settings';

const schema = z.object({ role: z.enum(['user', 'client']) });

export const POST = route(async (req) => {
  const session = await readSession();
  if (!session || session.role === 'admin') throw new ApiError(401, 'Sign in to switch roles.');

  const { role: selectedRole } = schema.parse(await req.json());
  const targetRole: MarketplaceRole = selectedRole === 'client' ? 'buyer' : 'user';
  const currentRole = session.role as MarketplaceRole;
  const CurrentProfile = profileModel(currentRole);
  const currentProfile = await CurrentProfile.findById(session.id);
  if (!currentProfile) throw new ApiError(401, 'Your profile could not be found. Sign in again.');

  const wallet = await Wallet.findOne({ account_role: currentRole, account_id: currentProfile._id });
  let identity = session.identityId ? await Identity.findById(session.identityId) : null;
  identity ??= await ensureIdentity(currentRole, currentProfile, wallet);

  const currentField = identityProfileField(currentRole);
  if (identity.get(currentField) && String(identity.get(currentField)) !== String(currentProfile._id)) {
    throw new ApiError(403, 'This session is not linked to the selected identity. Sign in again.');
  }
  if (!identity.get(currentField)) {
    identity.set(currentField, currentProfile._id);
    if (!identity.roles.includes(currentRole)) identity.roles.push(currentRole);
  }
  identity.email = String(currentProfile.email).toLowerCase();
  identity.firstname = currentProfile.firstname;
  identity.lastname = currentProfile.lastname;
  await identity.save();

  const field = identityProfileField(targetRole);
  let targetProfile = identity.get(field);
  if (targetProfile) {
    targetProfile = await profileModel(targetRole).findById(targetProfile);
    if (!targetProfile) throw new ApiError(409, 'The linked profile is missing. Contact support to restore it.');
    if (targetProfile.status === 0) throw new ApiError(403, 'This profile is disabled. Please contact support.');
    targetProfile.firstname = identity.firstname;
    targetProfile.lastname = identity.lastname;
    await targetProfile.save();
  } else {
    const settings = await getSettings();
    const allowed = targetRole === 'user' ? settings.registration : settings.buyerRegistration;
    if (!allowed) throw new ApiError(403, `${targetRole === 'user' ? 'Freelancer' : 'Client'} registration is disabled.`);

    const email = String(identity.email || currentProfile.email).toLowerCase();
    const TargetProfile = profileModel(targetRole);
    if (await TargetProfile.exists({ email })) {
      throw new ApiError(409, `A separate ${targetRole === 'user' ? 'freelancer' : 'client'} profile already uses this email. Sign in to that profile before linking accounts.`);
    }

    try {
      targetProfile = await TargetProfile.create({
        firstname: identity.firstname ?? currentProfile.firstname,
        lastname: identity.lastname ?? currentProfile.lastname,
        email,
        username: currentProfile.username,
      });
      identity.set(field, targetProfile._id);
      if (!identity.roles.includes(targetRole)) identity.roles.push(targetRole);
      await identity.save();
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ApiError(409, 'A profile with these account details already exists. Sign in to that profile before linking accounts.');
      }
      throw error;
    }
  }

  await startSession(String(targetProfile._id), targetRole, String(identity._id));
  return ok({ role: selectedRole, destination: targetRole === 'user' ? '/freelancer/dashboard' : '/client/dashboard' });
});
