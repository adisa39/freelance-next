'use client';

import { useState } from 'react';
import { api } from '@/lib/client';

declare global {
  interface Window {
    ethereum?: { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
  }
}

type Props = { mode: 'login' | 'register'; role: 'user' | 'buyer'; heading: string; welcome: string; switching: { a: string; b: string }; images: { shape: string; thumb: string; logo: string } };

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 19042026);

export default function AuthForm({ mode, role, heading, welcome, switching, images }: Props) {
  const [profile, setProfile] = useState({ firstname: '', lastname: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'waiting' | 'working'>('idle');
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const base = role === 'user' ? '/freelancer' : '/buyer';
  const isRegister = mode === 'register';

  const connect = async () => {
    setFailed(false);
    setStatus('waiting');
    setMessage('Waiting for your InterLink wallet…');
    try {
      const wallet = window.ethereum;
      if (!wallet) throw new Error('Open this page in InterLink or connect an InterLink compatible wallet.');
      const accounts = await wallet.request({ method: 'eth_requestAccounts' });
      if (!Array.isArray(accounts) || typeof accounts[0] !== 'string' || !/^0x[\da-f]{40}$/i.test(accounts[0])) throw new Error('No valid wallet address was returned.');
      const address = accounts[0];
      const chain = await wallet.request({ method: 'eth_chainId' });
      if (typeof chain !== 'string' || Number.parseInt(chain, 16) !== CHAIN_ID) throw new Error(`Switch your wallet to ITL Testnet (Chain ID ${CHAIN_ID}) and try again.`);

      setStatus('working');
      setMessage('Requesting a secure sign-in challenge…');
      const challenge = await api<{ challengeId: string; messageToSign: string }>('/api/auth/interlink', { body: { action: 'challenge', walletAddress: address } });
      setMessage('Approve the sign-in message in your wallet.');
      const bytes = new TextEncoder().encode(challenge.messageToSign);
      const hexMessage = `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
      const signature = await wallet.request({ method: 'personal_sign', params: [hexMessage, address] });
      if (typeof signature !== 'string') throw new Error('The wallet returned an invalid signature.');

      setMessage('Verifying your wallet…');
      await api('/api/auth/interlink', { body: {
        action: 'verify', flow: mode, role, walletAddress: address,
        challengeId: challenge.challengeId, message: challenge.messageToSign, signature,
        ...(isRegister ? profile : {}),
      } });
      window.location.href = `${base}/dashboard`;
    } catch (error) {
      setFailed(true);
      setMessage((error as Error).message || 'Wallet sign-in failed. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <section className="account"><div className="account-inner">
      <div className="account-inner__left">
        <div className="account-inner__shape"><img src={images.shape} alt="" /></div>
        <div className="account-thumb"><img src={images.thumb} alt="" /></div>
      </div>
      <div className="account-inner__right"><div className="account-form-wrapper">
        <a href="/" className="account-form__logo"><img src={images.logo} alt="" /></a>
        <form className="account-form" onSubmit={(e) => { e.preventDefault(); void connect(); }}>
          <div className="radio-btn-wrapper">
            <div className="form--radio"><input className="form-check-input" type="radio" name="apply-wrapper" id="apply-freelancer" checked={role === 'user'} onChange={() => { window.location.href = `/freelancer/${mode}`; }} /><label className="form-check-label" htmlFor="apply-freelancer"><span className="text">{switching.a}</span></label></div>
            <div className="form--radio"><input className="form-check-input" type="radio" name="apply-wrapper" id="apply-buyer" checked={role === 'buyer'} onChange={() => { window.location.href = `/buyer/${mode}`; }} /><label className="form-check-label" htmlFor="apply-buyer"><span className="text">{switching.b}</span></label></div>
          </div>
          <p className="text">{welcome}</p>
          <h5 className="account-form__title">{heading}</h5>

          {isRegister && <div className="row">
            <div className="col-sm-6 form-group"><label htmlFor="firstname" className="form--label">First Name</label><input id="firstname" className="form-control form--control" autoComplete="given-name" maxLength={80} required value={profile.firstname} onChange={(e) => setProfile({ ...profile, firstname: e.target.value })} /></div>
            <div className="col-sm-6 form-group"><label htmlFor="lastname" className="form--label">Last Name</label><input id="lastname" className="form-control form--control" autoComplete="family-name" maxLength={80} required value={profile.lastname} onChange={(e) => setProfile({ ...profile, lastname: e.target.value })} /></div>
            <div className="col-12 form-group"><label htmlFor="email" className="form--label">Email Address</label><input id="email" type="email" className="form-control form--control" autoComplete="email" maxLength={254} required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
          </div>}

          <div className="form-group">
            <button type="submit" className="btn btn--base w-100" disabled={status !== 'idle'}>
              <span aria-hidden="true" style={{ marginRight: 8 }}>◎</span>
              {status === 'waiting' ? 'Waiting for InterLink…' : status === 'working' ? 'Verifying wallet…' : 'Connect using InterLink App'}
            </button>
            {message && <p className={`text-center mt-2${failed ? ' text-danger' : ''}`} role={failed ? 'alert' : 'status'} aria-live="polite">{message}</p>}
            <p className="text-center mt-2">Your wallet signature securely verifies account ownership.</p>
          </div>
          {isRegister
            ? <p className="account-form__text">Already have an account? <a href={`${base}/login`} className="text--base">Login Now</a></p>
            : <p className="account-form__text">New to the marketplace? <a href={`${base}/register`} className="text--base">Create Account</a></p>}
        </form>
      </div></div>
    </div></section>
  );
}
