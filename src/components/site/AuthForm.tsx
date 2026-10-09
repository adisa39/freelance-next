'use client';
import { useState } from 'react';
import { api } from '@/lib/client';

type Props = { mode: 'login' | 'register'; role: 'user' | 'buyer'; heading: string; welcome: string; switching: { a: string; b: string }; policies: { slug: string; title: string }[]; images: { shape: string; thumb: string; logo: string } };

/** Port of user|buyer/auth/login|register.blade.php — identical markup/classes; submits to the JSON auth API. */
export default function AuthForm({ mode, role, heading, welcome, switching, policies, images }: Props) {
  const [f, setF] = useState({ login: '', password: '', firstname: '', lastname: '', email: '', password_confirmation: '', agree: false });
  const [show, setShow] = useState({ p: false, c: false }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const base = role === 'user' ? '/freelancer' : '/buyer';
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      if (mode === 'login') await api('/api/auth/login', { body: { role, login: f.login, password: f.password } });
      else await api('/api/auth/register', { body: { role, firstname: f.firstname, lastname: f.lastname, email: f.email, password: f.password, password_confirmation: f.password_confirmation } });
      window.location.href = `${base}/dashboard`;
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  };
  const Pw = ({ id, name, value, k, sk }: { id: string; name: string; value: string; k: 'password' | 'password_confirmation'; sk: 'p' | 'c' }) => (
    <div className="position-relative">
      <input id={id} type={show[sk] ? 'text' : 'password'} name={name} value={value} onChange={set(k)} className="form--control form-control" autoComplete="off" required />
      <span className={`password-show-hide fa-solid ${show[sk] ? 'fa-eye-slash' : 'fa-eye'} toggle-password`} aria-label="Toggle password visibility" onClick={() => setShow({ ...show, [sk]: !show[sk] })} />
    </div>
  );
  return (
    <section className="account"><div className="account-inner">
      <div className="account-inner__left">
        <div className="account-inner__shape"><img src={images.shape} alt="" /></div>
        <div className="account-thumb"><img src={images.thumb} alt="" /></div>
      </div>
      <div className="account-inner__right"><div className="account-form-wrapper">
        <a href="/" className="account-form__logo"><img src={images.logo} alt="" /></a>
        <form onSubmit={submit}><div className="account-form">
          <div className="radio-btn-wrapper">
            <div className="form--radio"><input className="form-check-input" type="radio" name="apply-wrapper" id="apply-freelancer" value="1" checked={role === 'user'} onChange={() => { window.location.href = `/freelancer/${mode}`; }} /><label className="form-check-label" htmlFor="apply-freelancer"><span className="text">{switching.a}</span></label></div>
            <div className="form--radio"><input className="form-check-input" type="radio" name="apply-wrapper" id="apply-buyer" value="2" checked={role === 'buyer'} onChange={() => { window.location.href = `/buyer/${mode}`; }} /><label className="form-check-label" htmlFor="apply-buyer"><span className="text">{switching.b} </span></label></div>
          </div>
          <p className="text">{welcome}</p>
          <h5 className="account-form__title"> {heading}</h5>
          <div className="row">
            {mode === 'login' ? (
              <>
                <div className="col-12"><div className="form-group"><label htmlFor="username" className="form--label"> Username or Email </label><input type="text" name="username" value={f.login} onChange={set('login')} className="form-control form--control" id="username" required /></div></div>
                <div className="col-12"><div className="form-group"><label htmlFor="your-password" className="form--label">Password</label><Pw id="your-password" name="password" value={f.password} k="password" sk="p" /></div></div>
                <div className="col-12"><div className="form-group"><div className="flex-between"><div className="form--check"><input className="form-check-input" type="checkbox" name="remember" id="flexCheckChecked" /><label className="form-check-label" htmlFor="flexCheckChecked"> Remember Me </label></div><a href={`${base}/password/reset`} className="forgot-password"> Forgot password? </a></div></div></div>
                {err && <div className="col-12"><p className="text-danger">{err}</p></div>}
                <div className="col-12 form-group"><button type="submit" className="btn btn--base w-100" disabled={busy}> Login Account </button></div>
              </>
            ) : (
              <>
                <div className="col-sm-6 form-group"><label htmlFor="firstname" className="form--label"> First Name </label><input type="text" className="form-control form--control" name="firstname" value={f.firstname} onChange={set('firstname')} id="firstname" autoComplete="off" required /></div>
                <div className="col-sm-6 form-group"><label htmlFor="lastname" className="form--label"> Last Name </label><input type="text" className="form-control form--control" name="lastname" value={f.lastname} onChange={set('lastname')} id="lastname" autoComplete="off" required /></div>
                <div className="col-sm-12 form-group"><label htmlFor="email" className="form--label"> Email Address </label><input type="email" className="form--control form-control checkUser" name="email" value={f.email} onChange={set('email')} id="email" autoComplete="off" required /></div>
                <div className="col-sm-6 form-group"><label htmlFor="your-password" className="form--label">Password</label><Pw id="your-password" name="password" value={f.password} k="password" sk="p" /></div>
                <div className="col-sm-6 form-group"><label htmlFor="confirm-password" className="form--label">Confirm Password</label><Pw id="confirm-password" name="password_confirmation" value={f.password_confirmation} k="password_confirmation" sk="c" /></div>
                <div className="form-group form--check mb-2 flex-nowrap"><input type="checkbox" className="form-check-input" id="agree" name="agree" checked={f.agree} onChange={set('agree')} required /><label htmlFor="agree" className="mx-2"> I agree with {policies.map((p, i) => <span key={p.slug}><a href={`/policy/${p.slug}`} target="_blank" rel="noreferrer">{p.title}</a>{i < policies.length - 1 ? ' , ' : ''}</span>)}</label></div>
                {err && <div className="col-12"><p className="text-danger">{err}</p></div>}
                <div className="col-sm-12 form-group"><button type="submit" id="recaptcha" className="btn btn--base w-100" disabled={busy}> Register Account </button></div>
              </>
            )}
          </div>
          {mode === 'login'
            ? <p className="account-form__text"> Don&apos;t have on account yet? <a href={`${base}/register`} className="text--base "> Create Account </a></p>
            : <p className="account-form__text"> Already have an account? <a href={`${base}/login`} className="text--base apply-form"> Login Now </a></p>}
        </div></form>
      </div></div>
    </div></section>
  );
}
