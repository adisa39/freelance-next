import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/site/Breadcrumb';
import PageCss from '@/components/site/PageCss';
import { getTalent } from '@/lib/public-data';
import { asset, showAmount, strLimit, userImage } from '@/lib/template';
import { VERIFY_SVGS } from '@/lib/svgs';

const Stars = ({ n, cls = 'review-rating-list__item' }: { n: number; cls?: string }) => <>{Array.from({ length: Math.ceil(Math.min(n ?? 0, 5)) }).map((_, i) => <li key={i} className={cls}> <i className="las la-star" /> </li>)}</>;

export default async function Talent({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const d = await getTalent(username);
  if (!d) notFound();
  const { f, jobSuccess, done, reviews, similar, topSkills } = d;
  const name = `${f.firstname ?? ''} ${f.lastname ?? ''}`.trim();
  const portfolios = (f.portfolios ?? []).filter((p: { status: number }) => p.status === 1);
  const Info = ({ icon, text }: { icon: string; text: React.ReactNode }) => <div className="info-item"><span className="info-item__thumb"><img src={asset(`templates/basic/icons/${icon}.png`)} alt="" /></span><p className="info-item__text">{text}</p></div>;
  return (
    <>
      <PageCss name="freelancer_explore" />
      <Breadcrumb title="Explore" subTitle="Talents" toRoute="/talents" />
      <div className="profile-section mt-60 mb-120"><div className="container"><div className="row gy-4">
        <div className="col-lg-8"><div className="profile-wrapper">
          <div className="profile-wrapper__profile">
            <div className="profile-thumb"><img src={userImage(f.image)} alt="" /></div>
            <div className="main-content-wrapper">
              <div className="profile-content">
                <h5 className="profile-content__name"> {name}</h5>
                <span className="profile-content__title"> {f.tagline} </span>
                <ul className="rating-list"><Stars n={f.avgRating} cls="rating-list__item" /><li className="rating-list__number"> ({f.avgRating}) </li></ul>
                <div className="profile-content__info">
                  <Info icon="check" text={<>{jobSuccess.toFixed(2)}% Job Success</>} />
                  <Info icon="thumb" text={<>{done} Complete Job</>} />
                  {f.badge && <Info icon="top-rated" text={<>{f.badge.badgeName} Level</>} />}
                  <Info icon="location" text={<>{f.city ? `${f.city},` : ''} {f.countryName}</>} />
                </div>
              </div>
              <div className="profile-action-btn">
                <a href="/client/login" className="profile-action-btn__bid btn btn--sm"> Invite to bid </a>
              </div>
            </div>
          </div>
          <div className="profile-wrapper__body">
            <div className="body-content">
              <h6 className="body-content__title"> Why should you work with me ? </h6>
              <div className="body-content__desc" dangerouslySetInnerHTML={{ __html: f.about ?? '' }} />
              <div className="proficiency-wrapper"><div className="proficiency-wrapper__item"><p className="proficiency-wrapper__title"> My Specializations </p><ul className="proficiency-list">{f.skillIds.map((s: { _id: string; name: string }) => <li key={s._id} className="proficiency-list__item">{s.name}</li>)}</ul></div></div>
            </div>
            <div className="review-wrapper"><h6 className="review-content__title"> Recent Reviews </h6><div className="review-content-container">
              {reviews.length ? reviews.map((r: { _id: string; rating: number; review: string; buyer?: { firstname?: string; lastname?: string; countryName?: string } }) => (
                <div key={r._id} className="review-content"><p className="review-content__name"> {`${r.buyer?.firstname ?? ''} ${r.buyer?.lastname ?? ''}`.trim()}</p><span className="review-content__address"> From {r.buyer?.countryName} </span><ul className="review-rating-list"><Stars n={r.rating} /></ul><p className="review-content__desc">{r.review}</p></div>
              )) : <div className="empty-message text-center mb-3"><img src={asset('templates/basic/images/empty.png')} alt="empty" /><h6 className="text-muted mt-3">No recent reviews!</h6></div>}
            </div></div>
            {portfolios.length > 0 && <div className="portfolio"><h6 className="portfolio__title"> My Portfolio </h6><div className="portfolio-wrapper">{portfolios.map((p: { _id: string; title: string; image?: string }) => <div key={p._id} className="portfolio-item"><div className="portfolio-item__thumb"><img src={p.image ? `/api/uploads/portfolio/${p.image}` : asset('images/default.png')} alt="" /></div><div className="portfolio-item__content"><h6 className="portfolio-item__title"><span className="portfolio-item__title-link">{p.title}</span></h6></div></div>)}</div></div>}
          </div>
          <div className="profile-wrapper__bottom"><h6 className="title"> Freelancer Similar Skills</h6><div className="row gy-4 justify-content-center">
            {similar.length ? similar.map((u: { _id: string; username: string; firstname?: string; lastname?: string; tagline?: string; image?: string; avgRating: number; badge?: { badgeName: string }; skillIds: { _id: string; name: string }[] }) => (
              <div key={u._id} className="col-xl-4 col-sm-6"><div className="freelancer-item">
                <div className="freelancer-item__thumb"><img src={userImage(u.image)} alt="" /></div>
                <div className="freelancer-item__content">
                  <h6 className="freelancer-item__name"> {`${u.firstname ?? ''} ${u.lastname ?? ''}`.trim()} </h6>
                  {u.badge && <small className="text--base"><i className="las la-award" /> {u.badge.badgeName}</small>}
                  <span className="freelancer-item__designation">{strLimit(u.tagline ?? '', 45)}</span>
                  <ul className="text-list"><li className="text-list__item"><Stars n={u.avgRating} cls="" /></li><li className="text-list__item">({u.avgRating})</li></ul>
                  <ul className="skill-list">{u.skillIds.map((s) => <li key={s._id} className="skill-list__item"><span className="skill-list__link">{s.name}</span></li>)}</ul>
                  <div className="freelancer-item__btn"><a href={`/talent/details/${u.username}`} className="btn--base btn btn--sm"> View Profile </a></div>
                </div>
              </div></div>
            )) : <div className="empty-message text-center py-5"><img src={asset('templates/basic/images/empty.png')} alt="empty" /><p className="text-muted mt-3">No freelancer found!</p></div>}
          </div></div>
        </div></div>
        <div className="col-lg-4"><div className="sidebar-wrapper">
          <div className="sidebar-item"><h6 className="sidebar-item__title"> Verifications </h6><div className="sidebar-item__verify">
            {[['Profile Status', f.workProfileComplete ? 'Complete' : 'Incomplete', 1], ['Verified Email', `Verified ${name} email`, 2], ['Verified Mobile', `Verified ${name} mobile`, 1], [f.workProfileComplete ? 'Profile Verified' : 'Profile Unverified', f.workProfileComplete ? `Verified ${name} profile` : 'Your profile is not yet verified. Please complete your profile to become verified.', 0]].map(([t, x, i]) => (
              <a key={t as string} href="#" className="verify-item"><span className="verify-item__icon" dangerouslySetInnerHTML={{ __html: VERIFY_SVGS[i as number] ?? VERIFY_SVGS[0] ?? '' }} /><div className="verify-item__content"><span className="verify-item__title"> {t as string} </span><p className={`verify-item__text${f.workProfileComplete || i !== 0 ? '' : ' unverified-text'}`}>{x as string}</p></div></a>
            ))}
          </div></div>
          <div className="sidebar-item"><h6 className="sidebar-item__title"> Top Skilled Jobs </h6><ul className="performer-list">{topSkills.length ? topSkills.map((k: { name: string; count: number }) => <li key={k.name} className="performer-list__item"><span className="text"> {k.name}</span><span className="value"> {k.count} </span></li>) : <div className="empty-message text-center py-5"><img src={asset('templates/basic/images/empty.png')} alt="empty" /><p className="text-muted mt-3">No top skill found!</p></div>}</ul></div>
        </div></div>
      </div></div></div>
    </>
  );
}
void showAmount;
