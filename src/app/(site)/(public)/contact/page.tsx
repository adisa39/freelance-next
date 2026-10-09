import Breadcrumb from '@/components/site/Breadcrumb';
import ContactForm from '@/components/site/ContactForm';
import { SECTIONS } from '@/components/site/sections';
import { getContent, getPage } from '@/lib/cms';
import { readSession } from '@/lib/auth';

export const metadata = { title: 'Contact Us' };

const css = `.contact-section .social-list__link{width:38px;height:38px;color:hsl(var(--base));font-size:14px;border:1px solid hsl(var(--base));background-color:hsl(var(--white)/.15)!important}.contact-section .social-list__link:hover{color:hsl(var(--white))!important;background-color:hsl(var(--base))!important}`;

export default async function Contact() {
  const [c, social, page, session] = await Promise.all([getContent('contact_us.content', true), getContent('social_icon.element', false, null, true), getPage('contact'), readSession()]);
  return (
    <>
      <Breadcrumb title="Contact Us" />
      <div className="contact-section  mb-120"><div className="container">
        <div className="row gy-4 justify-content-between align-items-center flex-wrap-reverse">
          <div className="col-xl-4"><div className="contact-item-wrapper">
            <h5 className="contact-item-wrapper__title">{c.title}</h5>
            <div>
              <div className="contact-item"><span className="contact-item__icon"><i className="fa-solid fa-house-user" /></span><div className="contact-item__content"><p className="contact-item__title"> Office Address </p><p className="contact-item__desc">{c.contact_details}</p></div></div>
              <div className="contact-item"><span className="contact-item__icon"><i className="fa-solid fa-paper-plane" /></span><div className="contact-item__content"><p className="contact-item__title"> Email Address </p><p className="contact-item__desc"><a href={`mailto:${c.email_address}`} title="E-mail us" className="link">{c.email_address}</a></p></div></div>
              <div className="contact-item"><span className="contact-item__icon"><i className="fa-solid fa-phone-volume" /></span><div className="contact-item__content"><p className="contact-item__title"> Phone Number </p><p className="contact-item__desc"><a href={`tel:${c.contact_number}`} title="Call Us" className="link">{c.contact_number}</a></p></div></div>
            </div>
            <div className="contact-item-wrapper__bottom"><div className="social-list-wrapper"><p className="title"> Follow Us </p>
              <ul className="social-list">{social.map((s) => <li key={s.id} className="social-list__item"><a href={s.dataValues.url} target="_blank" rel="noreferrer" title={s.dataValues.title} className="social-list__link flex-center" dangerouslySetInnerHTML={{ __html: s.dataValues.social_icon }} /></li>)}</ul>
            </div></div>
          </div></div>
          <div className="col-xl-7"><div className="contact-form-wrapper">
            <h4 className="contact-form-wrapper__title">{c.heading}</h4>
            <p className="contact-form-wrapper__desc">{c.subheading}</p>
            <ContactForm signedIn={!!session && session.role !== 'admin'} />
          </div></div>
        </div>
      </div></div>
      {page?.secs.map((s) => { const C = SECTIONS[s]; return C ? <C key={s} /> : null; })}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
