import { getContent } from '@/lib/cms';
import { asset, frontendImage } from '@/lib/template';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { BadgeSetting, Skill } from '@/models/Catalog';
import Empty from './Empty';
import FreelancerCard, { type FreelancerView } from './FreelancerCard';
import SubscribeForm from './SubscribeForm';

void BadgeSetting; void Skill; // ensure models are registered for populate()
type P = React.ReactNode;
const Hl = ({ cls, brk, len, children }: { cls: string; brk: number; len: number; children: P }) => <h2 className={`${cls} s-highlight`} data-s-break={brk} data-s-length={len}>{children}</h2>;
const clientCopy = (value: unknown) => String(value ?? '').replace(/\bbuyer(s)?\b/gi, (_match, plural: string | undefined) => plural ? 'clients' : 'client');

export async function Banner() {
  const [b, clients] = await Promise.all([getContent('banner.content', true), getContent('client.element', false, null, true)]);
  return (
    <section className="banner-section">
      <div className="banner-section__shape"><img src={frontendImage('banner', b.shape)} alt="" /></div>
      <div className="container">
        <div className="row gy-5 align-items-start">
          <div className="col-lg-6">
            <div className="banner-content highlight">
              <h1 className="banner-content__title s-highlight" data-s-break="-1" data-s-length="1">{b.heading}</h1>
              <p className="banner-content__desc">{b.subheading}</p>
            </div>
            <form id="dynamic-route" action="/freelance-jobs" method="GET">
              <div className="search-container">
                <input type="search" name="search" className="form--control" placeholder="Type job keyword" />
                <div className="banner-search-select">
                  <select className="form-select form--control select2" data-minimum-results-for-search="-1" id="target-area" defaultValue="1">
                    <option value="1" data-redirect="/freelance-jobs">Job</option>
                    <option value="2" data-redirect="/talents">Talent</option>
                  </select>
                </div>
                <button className="icon" type="submit"><span className="search-icon"><i className="las la-search" /></span><small className="search-text">Search</small></button>
              </div>
            </form>
            <div className="buyer-wrapper">
              <span className="buyer-wrapper__title">{String(b.subtitle ?? '').replace(/\bbuyer(s)?\b/gi, (_match, plural: string | undefined) => plural ? 'clients' : 'client')}</span>
              <div className="brand-slider">{clients.map((c) => <img key={c.id} src={frontendImage('client', c.dataValues.image)} alt="" />)}</div>
            </div>
          </div>
          <div className="col-lg-6 d-xsm-block d-none">
            <div className="banner-thumb-wrapper">
              <div className="banner-thumb"><img src={frontendImage('banner', b.image)} alt="" /></div>
              <div className="banner-thumb-wrapper__content">
                <div className="banner-thumb-wrapper__item one">{b.feature_one}</div>
                <div className="banner-thumb-wrapper__item two">{b.feature_two}</div>
                <div className="banner-thumb-wrapper__item three">
                  <span className="icon"><img src={asset('templates/basic/shape/heart.png')} alt="" /></span>
                  <div className="content"><span className="text"> {b.feature_three}</span>
                    <ul className="rating-list">{[0, 1, 2, 3, 4].map((i) => <li key={i} className="rating-list__item"> <i className="las la-star" /> </li>)}</ul></div>
                </div>
              </div>
              <div className="banner-thumb-shape"><span className="banner-thumb-shape__one" /><span className="banner-thumb-shape__two" /><span className="banner-thumb-shape__three" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Heading = ({ c, brk = -2, len = 2 }: { c: Record<string, string>; brk?: number; len?: number }) => (
  <div className="row justify-content-center"><div className="col-lg-10"><div className="section-heading two">
    <Hl cls="section-heading__title" brk={brk} len={len}>{c.heading}</Hl><p className="section-heading__desc"> {c.subheading}</p>
  </div></div></div>
);

export async function HowWork() {
  const [c, els] = await Promise.all([getContent('how_work.content', true), getContent('how_work.element', false, null, true)]);
  return (
    <div className="how-wowrk-section my-120"><div className="container">
      <Heading c={c} />
      <div className="row gy-4">
        {els.length ? els.map((w) => (
          <div key={w.id} className="col-lg-3 col-sm-6"><div className="how-work-item">
            <span className="how-work-item__icon" dangerouslySetInnerHTML={{ __html: w.dataValues.icon }} />
            <div className="how-work-item__content"><h5 className="how-work-item__title"> {w.dataValues.title} </h5><p className="how-work-item__desc"> {w.dataValues.content} </p></div>
            <div className="how-work-item__shape"><img src={asset('templates/basic/shape/how-work.png')} alt="" /></div>
          </div></div>
        )) : <Empty message="Work process not found!" />}
      </div>
    </div></div>
  );
}

export async function Account() {
  const a = await getContent('account.content', true);
  const item = (title: string, text: string, btn: string, href: string, img: string) => (
    <div className="col-xl-6"><div className="account-item">
      <div className="account-item__content highlight">
        <h3 className="account-item__title s-highlight" data-s-break="-1" data-s-length="1"> {title}</h3>
        <p className="account-item__text"> {text}</p>
        <div className="account-item__btn"><a href={href} className="btn btn--base">{btn}</a></div>
      </div>
      <div className="account-item__thumb"><img src={img} alt="" /></div>
    </div></div>
  );
  return (
    <div className="account-section my-120"><div className="container"><div className="row gy-4">
      {item(a.freelancer_title, a.freelancer_content, a.freelancer_button_name, '/freelancer/register', frontendImage('account', a.freelancer))}
      {item(clientCopy(a.buyer_title), clientCopy(a.buyer_content), clientCopy(a.buyer_button_name), '/client/register', frontendImage('account', a.buyer))}
    </div></div></div>
  );
}

export async function WhyChoose() {
  const [c, els] = await Promise.all([getContent('why_choose.content', true), getContent('why_choose.element', false, 8, true)]);
  return (
    <div className="why-choose-section my-120"><div className="container">
      <Heading c={c} />
      {els.length ? (
        <div className="choose-wrapper">{els.map((i) => (
          <div key={i.id} className="choose-item">
            <span className="choose-item__icon"><img src={frontendImage('why_choose', i.dataValues.image)} className="choose us" alt="" /></span>
            <div className="choose-item__content"><h5 className="choose-item__title"> {i.dataValues.title} </h5><p className="choose-item__desc">{i.dataValues.content}</p></div>
          </div>
        ))}</div>
      ) : <div className="d-flex flex-column justify-content-center align-items-center"><div className="text-center"><img src={asset('templates/basic/images/empty.png')} alt="empty" className="img-fluid" /><h6 className="text-muted mt-3">Choose us data not found</h6></div></div>}
    </div></div>
  );
}

export async function FindTask() {
  const [c, els] = await Promise.all([getContent('find_task.content', true), getContent('find_task.element', false, 4, true)]);
  return (
    <div className="work-section my-120"><div className="container"><div className="work-container">
      <div className="work-container__content highlight">
        <h5 className="work-container__subtitle"> {c.subtitle} </h5>
        <Hl cls="work-container__title" brk={-2} len={2}>{c.heading}</Hl>
        <p className="work-container__desc"> {c.subheading} </p>
        <ul className="list">{els.map((i) => <li key={i.id} className="list-item"> {i.dataValues.find_step} </li>)}</ul>
        <a href="/freelance-jobs" className="btn btn--base btn--lg"> {c.button_name}</a>
      </div>
      <div className="work-container__thumb"><img src={frontendImage('find_task', c.image)} alt="" /></div>
      <div className="work-container__shape"><img src={frontendImage('find_task', c.shape)} alt="" /></div>
    </div></div></div>
  );
}

export async function Facility() {
  const [c, els] = await Promise.all([getContent('facility.content', true), getContent('facility.element', false, 4, true)]);
  return (
    <div className="facility-section my-120"><div className="container">
      <Heading c={c} brk={1} len={1} />
      <div className="row gy-4 align-items-center">
        <div className="col-lg-6 pe-lg-5"><div className="facility-wrapper">
          {els.length ? els.map((f) => (
            <div key={f.id} className="facility-item">
              <h5 className="facility-item__title"><span className="facility-item__icon"> <i className="las la-check" /> </span> {f.dataValues.title}</h5>
              <p className="facility-item__desc"> {f.dataValues.content} </p>
            </div>
          )) : <Empty message="Facilities not found!" />}
        </div></div>
        <div className="col-lg-6 ps-lg-5"><div className="facility-thumb"><img src={frontendImage('facility', c.image)} alt="" /></div></div>
      </div>
    </div></div>
  );
}

export async function CompletionWork() {
  const [c, els] = await Promise.all([getContent('completion_work.content', true), getContent('completion_work.element', false, 4, true)]);
  return (
    <div className="work-completion my-120"><div className="container"><div className="work-completion-wrapper">
      <div className="work-completion-content highlight">
        <h5 className="work-completion-content__subtitle text--base"> {c.heading}</h5>
        <Hl cls="work-completion-content__title" brk={-1} len={1}>{c.subheading}</Hl>
        <ul className="list">{els.length ? els.map((i) => <li key={i.id} className="list-item">{i.dataValues.done_step}</li>) : <Empty message="Done work not found!" />}</ul>
      </div>
      <div className="work-completion-thumb"><img src={frontendImage('completion_work', c.image)} alt="" /></div>
    </div></div></div>
  );
}

async function topFreelancers(): Promise<FreelancerView[]> {
  if (!process.env.MONGODB_URI || process.env.CMS_SOURCE === 'json') return [];
  try {
    await connectDB();
    const rows = await User.find({ status: 1 }).sort({ earning: -1, avgRating: -1 }).limit(100).populate('skillIds', 'name').populate('badge', 'badgeName').lean();
    return JSON.parse(JSON.stringify(rows));
  } catch { return []; }
}

export async function TopFreelancer() {
  const [c, counters, list] = await Promise.all([getContent('top_freelancer.content', true), getContent('counter.element', false, 3, true), topFreelancers()]);
  return (
    <div className="best-freelancer-section py-120 my-120"><div className="container">
      <div className="row"><div className="col-lg-12"><div className="section-heading style-left highlight">
        <Hl cls="section-heading__title" brk={-1} len={1}>{c.heading}</Hl><p className="section-heading__desc"> {c.subheading}</p>
      </div></div></div>
      {list.length > 0 && <div className="best-freelancer">{list.map((f) => <FreelancerCard key={f._id} f={f} />)}</div>}
      <div className="counter-up-wrapper"><div className="counterup-item">
        {counters.length ? counters.map((ct, i) => (
          <div key={ct.id} className="counterup-item__content"><div className="counterup-wrapper">
            <span className="counterup-item__icon" dangerouslySetInnerHTML={{ __html: ct.dataValues.icon }} />
            <div className="content">
              <div className="counterup-item__number"><h5 className="counterup-item__title"><span className="odometer" data-odometer-final={ct.dataValues.digit} /> {i === 2 ? 'Minute' : 'Million'}</h5></div>
              <span className="counterup-item__text mb-0"> {ct.dataValues.content}</span>
            </div>
          </div></div>
        )) : <Empty message="Facilities not found!" />}
      </div></div>
    </div></div>
  );
}

export async function Subscribe() {
  const c = await getContent('subscribe.content', true);
  return (
    <div className="subscribe-section pt-120"><div className="container"><div className="subscribe-wrapper highlight">
      <div className="subscribe-wrapper__shape"><img src={frontendImage('subscribe', c.shape)} alt="" /></div>
      <div className="subscribe-content">
        <span className="subscribe-content__shape"><img src={asset('templates/basic/shape/subscribe.png')} alt="" /></span>
        <h4 className="subscribe-content__title s-highlight" data-s-break="-1" data-s-length="1"> {c.heading}</h4>
        <p className="subscribe-content__text"> <span className="fw-bold"> {c.subheading}</span></p>
        <SubscribeForm />
      </div>
      <div className="subscribe-thumb"><img src={frontendImage('subscribe', c.image)} alt="" /></div>
    </div></div></div>
  );
}

export async function Faq() {
  const [c, els] = await Promise.all([getContent('faq.content', true), getContent('faq.element', false, null, true)]);
  return (
    <div className="faq-section my-120"><div className="container">
      <div className="row"><div className="col-lg-12"><div className="section-heading two"><Hl cls="section-heading__title" brk={-2} len={2}>{c.heading}</Hl><p className="section-heading__desc"> {c.subheading} </p></div></div></div>
      <div className="row justify-content-center align-items-center gy-4">
        <div className="col-xxl-7 col-xl-6 pe-xxl-5">
          <div className="accordion accordion-filter custom--accordion" id="accordionExample">
            {els.map((it, i) => (
              <div key={it.id} className="accordion-item">
                <h2 className="accordion-header" id={`heading${i + 1}`}>
                  <button className={`accordion-button ${i ? 'collapsed' : ''}`} type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${i}`} aria-expanded={i ? 'false' : 'true'} aria-controls={`faq-${i}`}>
                    <span className="accordion-button__number"> {i + 1} </span> {it.dataValues.question}
                  </button>
                </h2>
                <div id={`faq-${i}`} className={`accordion-collapse collapse ${i ? '' : 'show'}`} aria-labelledby={`heading${i + 1}`} data-bs-parent="#accordionExample"><div className="accordion-body"> {it.dataValues.answer} </div></div>
              </div>
            ))}
            <div className="text-end"><button className="load-more-button"> Show more </button></div>
          </div>
        </div>
        <div className="col-xxl-5 col-xl-6  d-xl-block d-none"><div className="faq-thumb-wrapper"><div className="faq-thumb"><img src={frontendImage('faq', c.image)} alt="" /></div></div></div>
      </div>
    </div></div>
  );
}


export async function About() {
  const [c, els] = await Promise.all([getContent('about.content', true), getContent('about.element', false, 4, true)]);
  return (
    <div className="about-section my-120"><div className="container"><div className="row gy-4 align-items-center">
      <div className="col-lg-5 pe-xl-5">
        <div className="section-heading two"><h4 className="section-heading__title text-start"> {c.heading} </h4></div>
        <div className="about-wrapper">
          {els.length ? els.map((a) => (
            <div key={a.id} className="about-item">
              <span className="about-item__icon"><img src={frontendImage('about', a.dataValues.image)} alt="" /></span>
              <div className="about-item__content"><h5 className="about-item__title"> {a.dataValues.title} </h5><p className="about-item__desc"> {a.dataValues.content} </p></div>
            </div>
          )) : <Empty message="Done work not found!" />}
        </div>
      </div>
      <div className="col-lg-7"><div className="about-thumb-wrapper">
        <div className="about-thumb-wrapper__shape"><img src={asset('templates/basic/shape/about-shape.png')} alt="" /></div>
        <div className="about-thumb-wrapper__thumb"><img src={frontendImage('about', c.image)} alt="" /><div className="shape-one" /><div className="shape-two" /></div>
      </div></div>
    </div></div></div>
  );
}

export async function Support() {
  const [sup, c, brands] = await Promise.all([getContent('support.content', true), getContent('brand.content', true), getContent('brand.element', false, null, true)]);
  return (
    <div className="support-section my-120"><div className="container"><div className="support-wrapper">
      <div className="support-wrapper__left">
        <h6 className="title">{c.heading}</h6>
        <div className="company-list">{brands.map((b) => <div key={b.id} className="company-name"><div className="thumb"><img src={frontendImage('brand', b.dataValues.image)} alt="" /></div></div>)}</div>
      </div>
      <div className="support-wrapper__right">
        <div className="support-content">
          <h4 className="support-content__title">{sup.heading}</h4>
          <p className="support-item"><span className="support-item__icon"> <i className="las fa-phone" /> </span> Hot Line: {sup.hotline_number}</p>
          <p className="support-item"><span className="support-item__icon"> <i className="las la-paper-plane" /> </span> Email: {sup.hotline_email}</p>
        </div>
        <div className="support-wrapper__shape"><img src={frontendImage('support', sup.shape)} alt="" /></div>
        <div className="support-wrapper__thumb"><img src={frontendImage('support', sup.image)} alt="" /></div>
      </div>
    </div></div></div>
  );
}

export async function Testimonial() {
  const [c, els] = await Promise.all([getContent('testimonial.content', true), getContent('testimonial.element', false, null, true)]);
  return (
    <section className="testimonials my-120"><div className="container">
      <div className="row justify-content-center"><div className="col-lg-10"><div className="section-heading two"><Hl cls="section-heading__title" brk={-1} len={1}>{c.heading}</Hl><p className="section-heading__desc">{c.subheading}</p></div></div></div>
      <div className="testimonial-slider">
        {els.map((it) => (
          <div key={it.id} className="testimonails-card"><div className="testimonial-item">
            <span className="testimonial-item__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 33" fill="none"><path d="M0 0.612305V32.6123L16 16.6123V0.612305H0Z" /><path d="M26.6666 0.612305V32.6123L42.6666 16.6123V0.612305H26.6666Z" /></svg></span>
            <p className="testimonial-item__desc"> {it.dataValues.quote} </p>
            <div className="testimonial-item__info">
              <div className="testimonial-item__thumb"><img src={frontendImage('testimonial', it.dataValues.image)} className="fit-image" alt="" /></div>
              <div className="testimonial-item__details"><h6 className="testimonial-item__name">{it.dataValues.name}</h6><span className="testimonial-item__designation"> From {it.dataValues.country} </span></div>
            </div>
          </div></div>
        ))}
      </div>
    </div></section>
  );
}

/** Registry used by CMS pages (Laravel `sections.<name>` includes). */
export const SECTIONS: Record<string, () => Promise<React.JSX.Element>> = {
  how_work: HowWork, account: Account, why_choose: WhyChoose, find_task: FindTask, facility: Facility, completion_work: CompletionWork, top_freelancer: TopFreelancer, subscribe: Subscribe, faq: Faq, about: About, support: Support, testimonial: Testimonial,
};
