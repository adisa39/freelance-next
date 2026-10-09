import { getContent, getPages, getSiteSettings } from '@/lib/cms';
import { readSession } from '@/lib/auth';

const Hi = ({ children }: { children: React.ReactNode }) => <h4 className="sign-up-content__title s-highlight" data-s-break="-1" data-s-length="1">{children}</h4>;

/** Port of partials/footer.blade.php */
export default async function SiteFooter() {
  const [acc, contact, policy, social, pages, s, session] = await Promise.all([
    getContent('account.content', true), getContent('contact_us.content', true), getContent('policy_pages.element', false, null, true),
    getContent('social_icon.element', false, null, true), getPages(), getSiteSettings(), readSession(),
  ]);
  const nav = pages.filter((p) => !p.isDefault);
  const dash = session?.role === 'buyer' ? '/buyer/dashboard' : session?.role === 'user' ? '/freelancer/dashboard' : null;
  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-area__top">
          <div className="sign-up-wrapper highlight">
            <div className="sign-up-content"><Hi>{acc.freelancer_title}</Hi><p className="sign-up-content__desc"> {acc.freelancer_content} </p><a href="/freelancer/register" className="sign-up-content__btn btn btn--base">{acc.freelancer_button_name} </a></div>
            <div className="sign-up-content"><Hi>{acc.buyer_title}</Hi><p className="sign-up-content__desc"> {acc.buyer_content} </p><a href="/buyer/register" className="sign-up-content__btn btn btn--base">{acc.buyer_button_name} </a></div>
          </div>
        </div>
        <div className="footer-wrapper py-60">
          <div className="footer-item">
            <h5 className="footer-item__title"> Navigation </h5>
            <ul className="footer-menu">
              <li className="footer-menu__item"><a href="/" className="footer-menu__link"> Home </a></li>
              <li className="footer-menu__item"><a href="/blogs" className="footer-menu__link"> Blogs </a></li>
              {nav.map((p) => <li key={p.slug} className="footer-menu__item"><a href={`/${p.slug}`} className="footer-menu__link"> {p.name} </a></li>)}
              <li className="footer-menu__item"><a href="/contact" className="footer-menu__link">Contact Us </a></li>
            </ul>
          </div>
          <div className="footer-item">
            <h5 className="footer-item__title"> Important Link </h5>
            <ul className="footer-menu">
              <li className="footer-menu__item"><a href={dash ?? '/freelancer/login'} className="footer-menu__link"> {dash ? 'Dashboard' : 'Login Now'} </a></li>
              <li className="footer-menu__item"><a href="/buyer/job/post/form" className="footer-menu__link"> Post a Job </a></li>
              <li className="footer-menu__item"><a href="/freelance-jobs" className="footer-menu__link"> Find a Jobs </a></li>
              <li className="footer-menu__item"><a href="/talents" className="footer-menu__link">Find a Talent </a></li>
            </ul>
          </div>
          <div className="footer-item">
            <h5 className="footer-item__title"> Terms </h5>
            <ul className="footer-menu">
              {policy.map((p) => <li key={p.id} className="footer-menu__item"><a href={`/policy/${p.slug}`} className="footer-menu__link">{p.dataValues.title}</a></li>)}
              <li className="footer-menu__item"><a href="/cookie-policy" className="footer-menu__link"> Cookie Policy </a></li>
            </ul>
          </div>
          <div className="footer-item">
            <h5 className="footer-item__title"> Contact Us</h5>
            <ul className="footer-contact-menu">
              <li className="footer-contact-menu__item"><div className="footer-contact-menu__item-icon"><i className="fas fa-map-marker-alt" /></div><div className="footer-contact-menu__item-content"><p> {contact.contact_details}</p></div></li>
              <li className="footer-contact-menu__item"><div className="footer-contact-menu__item-icon"><i className="fas fa-phone" /></div><div className="footer-contact-menu__item-content"><a title="Call us" href={`tel:${contact.contact_number}`}>{contact.contact_number}</a></div></li>
              <li className="footer-contact-menu__item"><div className="footer-contact-menu__item-icon"><i className="fas fa-envelope" /></div><div className="footer-contact-menu__item-content"><a title="E-mail us" href={`mailto:${contact.email_address}`}>{contact.email_address}</a></div></li>
            </ul>
            <div className="social-list-wrapper">
              <p className="title">Follow Us </p>
              <ul className="social-list">
                {social.map((x) => <li key={x.id} className="social-list__item"><a href={x.dataValues.url} target="_blank" rel="noreferrer" title={x.dataValues.title} className="social-list__link flex-center" dangerouslySetInnerHTML={{ __html: x.dataValues.social_icon }} /></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-footer py-3">
        <div className="container"><div className="row gy-3"><div className="col-md-12 text-center"><div className="bottom-footer-text"> Copyright &copy;{new Date().getFullYear()} <a href="/">{s.siteName}</a> All rights reserved .</div></div></div></div>
      </div>
    </footer>
  );
}
