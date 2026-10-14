import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { ApiError } from './api';
import { S } from './constants';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { Admin } from '@/models/Admin';

export type Role = 'user' | 'buyer' | 'admin'; // user = freelancer (Laravel "user" guard)
const COOKIE = 'session';
const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET must be set (>= 32 chars)');
  return new TextEncoder().encode(s);
};

export const hash = (p: string) => bcrypt.hash(p, 10);
export const compare = (p: string, h: string) => bcrypt.compare(p, h);

export async function startSession(id: string, role: Role, identityId?: string) {
  const token = await new SignJWT({ role, ...(identityId ? { identityId } : {}) }).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setExpirationTime('7d').sign(key());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 1 });
}
export async function endSession() { (await cookies()).delete(COOKIE); }

export async function readSession(): Promise<{ id: string; role: Role; identityId?: string } | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return payload.sub ? { id: payload.sub, role: payload.role as Role, ...(typeof payload.identityId === 'string' ? { identityId: payload.identityId } : {}) } : null;
  } catch { return null; }
}

type UserDoc = InstanceType<typeof User>;
type BuyerDoc = InstanceType<typeof Buyer>;
type AdminDoc = InstanceType<typeof Admin>;

/** Load the current account for a role, or throw 401/403. Banned accounts are rejected (check.status middleware). */
export async function requireUser(role: 'user'): Promise<UserDoc>;
export async function requireUser(role: 'buyer'): Promise<BuyerDoc>;
export async function requireUser(role: 'admin'): Promise<AdminDoc>;
export async function requireUser(role: Role): Promise<UserDoc | BuyerDoc | AdminDoc> {
  const s = await readSession();
  if (!s || s.role !== role) throw new ApiError(401, 'Unauthorized');
  const doc: UserDoc | BuyerDoc | AdminDoc | null =
    role === 'user' ? await User.findById(s.id) : role === 'buyer' ? await Buyer.findById(s.id) : await Admin.findById(s.id);
  if (!doc) throw new ApiError(401, 'Unauthorized');
  if (role !== 'admin' && (doc as UserDoc).status === S.USER.BAN) throw new ApiError(403, 'Account banned');
  return doc;
}

/** For endpoints shared by freelancers and buyers (chat, wallet, tickets). */
export async function requireParty(): Promise<{ role: 'user' | 'buyer'; acct: UserDoc | BuyerDoc }> {
  const s = await readSession();
  if (!s || (s.role !== 'user' && s.role !== 'buyer')) throw new ApiError(401, 'Unauthorized');
  return s.role === 'user' ? { role: 'user', acct: await requireUser('user') } : { role: 'buyer', acct: await requireUser('buyer') };
}
