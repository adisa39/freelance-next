import { z } from 'zod';
import { route, ok, ApiError, bad } from '@/lib/api';
import { startSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { Wallet } from '@/models/Wallet';
import type { Doc } from '@/models/_util';

const CHAIN_ID = Number(process.env.INTERLINK_CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || 19042026);
const RPC = (process.env.INTERLINK_RPC || 'https://evm-rpc.test-net.interlinklabs.ai/v1').replace(/\/$/, '');
const challengeSchema = z.object({ action: z.literal('challenge'), walletAddress: z.string().regex(/^0x[\da-f]{40}$/i) });
const verifySchema = z.object({
  action: z.literal('verify'), flow: z.enum(['login', 'register']), role: z.enum(['user', 'buyer']),
  walletAddress: z.string().regex(/^0x[\da-f]{40}$/i), challengeId: z.string().min(1).max(512),
  message: z.string().min(1).max(10000), signature: z.string().regex(/^0x[\da-f]{130}$/i),
  firstname: z.string().trim().min(1).max(80).optional(), lastname: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(254).optional(),
});

async function interlink(path: string, body: Record<string, string>) {
  let response: Response;
  try {
    response = await fetch(`${RPC}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(502, 'InterLink is temporarily unavailable. Please try again.');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok || !payload || typeof payload !== 'object') throw new ApiError(502, 'InterLink could not verify your wallet.');
  return payload as Record<string, unknown>;
}

export const POST = route(async (req) => {
  const raw: unknown = await req.json();
  if (!raw || typeof raw !== 'object' || !('action' in raw)) throw bad('Invalid wallet authentication request.');

  if (raw.action === 'challenge') {
    const data = challengeSchema.parse(raw);
    const payload = await interlink('/auth/challenge', { walletAddress: data.walletAddress, chainId: String(CHAIN_ID) });
    const result = payload.result as Record<string, unknown> | undefined;
    if (typeof result?.challengeId !== 'string' || typeof result.messageToSign !== 'string') {
      throw new ApiError(502, 'InterLink returned an invalid sign-in challenge.');
    }
    return ok({ challengeId: result.challengeId, messageToSign: result.messageToSign });
  }

  const data = verifySchema.parse(raw);
  if (data.flow === 'register') {
    const settings = await getSettings();
    if (data.role === 'user' && !settings.registration) throw new ApiError(400, 'Freelancer registration is disabled.');
    if (data.role === 'buyer' && !settings.buyerRegistration) throw new ApiError(400, 'Buyer registration is disabled.');
  }
  const walletAddress = data.walletAddress.toLowerCase();
  const verification = await interlink('/auth/verify', {
    walletAddress: data.walletAddress, challengeId: data.challengeId, message: data.message,
    signature: data.signature, chainId: String(CHAIN_ID),
  });
  const result = verification.result as Record<string, unknown> | undefined;
  if (typeof result?.accessToken !== 'string' || !result.accessToken) throw new ApiError(401, 'InterLink could not verify this wallet signature.');

  const Model = data.role === 'user' ? User : Buyer;
  let wallet = await Wallet.findOne({ address: walletAddress, chain_id: CHAIN_ID });
  let account: Doc | null = null;
  if (data.flow === 'login') {
    if (!wallet) throw new ApiError(404, 'No account is registered for this wallet. Choose Register to create one.');
    if (wallet.account_role !== data.role) throw new ApiError(403, 'This wallet is linked to a different account type.');
    const AccountModel = wallet.account_role === 'user' ? User : Buyer;
    account = await AccountModel.findById(wallet.account_id);
    if (!account) throw new ApiError(404, 'The account linked to this wallet could not be found.');
    if (account.status === 0) throw new ApiError(403, 'This account is disabled. Please contact support.');
  } else {
    if (wallet) throw new ApiError(409, 'This wallet already has an account. Choose Login to continue.');
    const { firstname, lastname, email } = data;
    if (!firstname || !lastname) throw bad('First and last name are required to create an account.');
    if (!email) throw bad('An email address is required to create an account.');
    const normalizedEmail = email.toLowerCase();
    if (await Model.exists({ email: normalizedEmail })) throw new ApiError(409, 'An account already uses this email address.');
    try {
      account = await Model.create({
        firstname, lastname, email: normalizedEmail,
        username: `il_${walletAddress.slice(2)}`,
      });
      await Wallet.create({
        account_id: account._id, account_role: data.role,
        address: walletAddress, chain_id: CHAIN_ID, provider: 'interlink', is_primary: true,
      });
    } catch (error) {
      if (account) await Model.deleteOne({ _id: account._id });
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ApiError(409, 'This wallet or email is already registered. Try signing in.');
      }
      throw error;
    }
  }

  if (!account) throw new ApiError(500, 'The account linked to this wallet could not be loaded.');
  await startSession(String(account._id), data.role);
  return ok({ id: account._id, role: data.role });
});
