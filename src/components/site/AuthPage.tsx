import AuthForm from './AuthForm';
import { getContent, getSiteSettings } from '@/lib/cms';
import { frontendImage, siteLogo } from '@/lib/template';

export default async function AuthPage({ mode, role }: { mode: 'login' | 'register'; role: 'user' | 'buyer' }) {
  const [c, sw, banner, policy, s] = await Promise.all([getContent(`${mode}.content`, true), getContent('switching_button.content', true), getContent('banner.content', true), getContent('policy_pages.element', false, null, true), getSiteSettings()]);
  return (
    <AuthForm mode={mode} role={role} heading={c.heading} welcome={mode === 'login' ? 'Welcome Back' : `Welcome to ${s.siteName}`}
      switching={mode === 'login' ? { a: sw.freelancer_login_button, b: sw.buyer_login_button } : { a: sw.freelancer_register_button, b: sw.buyer_register_button }}
      policies={policy.map((p) => ({ slug: p.slug as string, title: p.dataValues.title }))}
      images={{ shape: frontendImage('banner', banner.shape), thumb: frontendImage(mode, c.image), logo: siteLogo() }} />
  );
}
