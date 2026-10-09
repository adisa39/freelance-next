import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/site/Breadcrumb';
import PageCss from '@/components/site/PageCss';
import { BidButton, MoreBidders } from '@/components/site/JobBidPanel';
import { getJobDetails } from '@/lib/public-data';
import { getContent, getSiteSettings } from '@/lib/cms';
import { readSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Bid } from '@/models/Marketplace';
import { User } from '@/models/User';
import { VERIFY_SVGS } from '@/lib/svgs';
import { asset, frontendImage, showAmount, strLimit, userImage } from '@/lib/template';
import { jobTimeDifference, skillLevelLabel } from '@/lib/format';
import { humanDiff } from '@/lib/format';

const d = (x: string) => new Date(x).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ (\w+) /, ' $1, ');
const scope = (n: number) => (n === 1 ? 'Large' : n === 2 ? 'Medium' : 'Small');
const longevity = (n: number) => ({ 1: 'Less than 1 Week', 2: 'Less than 1 month', 3: '1 to 3 months' } as Record<number, string>)[n] ?? '3 to 6 months';

export default async function ExploreJob({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getJobDetails(slug);
  if (!data) notFound();
  const { job, buyerStats, jobsPosted, totalBidders, similar, totalSimilar, topSkills, bidders } = data;
  const [policies, banner, s, session] = await Promise.all([getContent('policy_pages.element', false, null, true), getContent('banner.content', true), getSiteSettings(), readSession()]);
  let profileComplete = false, alreadyBid = false;
  if (session?.role === 'user') {
    await connectDB();
    const [u, b] = await Promise.all([User.findById(session.id).select('workProfileComplete').lean(), Bid.exists({ job: job._id, user: session.id })]);
    profileComplete = !!u?.workProfileComplete; alreadyBid = !!b;
  }
  const buyer = job.buyer;
  const social = [['https://www.facebook.com/sharer/sharer.php?u=', 'fab fa-facebook-f'], ['https://twitter.com/share?url=', 'fa-brands fa-x-twitter'], ['https://www.linkedin.com/shareArticle?mini=true&url=', 'fab fa-linkedin-in'], ['https://wa.me/?text=', 'fab fa-whatsapp'], ['https://t.me/share/url?url=', 'fab fa-telegram']];
  const url = encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/explore-job/${slug}`);
  const Info = ({ icon, label, value }: { icon: string; label: string; value: string }) => <div className="project-info__item"><span className="project-info__icon"><i className={icon} /></span><div className="project-info__content"><p className="text"> {label} </p><span className="title">{value}</span></div></div>;
  return (
    <>
      <PageCss name="job_explore__details" />
      <Breadcrumb title="Explore" subTitle="Freelance Job" toRoute="/freelance-jobs" />
      <div className="job-details-section mt-60 mb-120"><div className="container"><div className="row gy-4">
        <div className="col-lg-8"><div className="job-details">
          <div className="details-item">
            <div className="bid-top">
              <div className="left"><h5 className="bid-top__title">{job.title}</h5><small> {jobTimeDifference(job.createdAt, job.deadline)}</small></div>
              <div className="right">
                {job.customBudget && <sup className="d-block">Flexible budget available.</sup>}
                <h5 className="price">{showAmount(job.budget, s.curSym)}</h5>
                <small className="text"> Bids: {job.bidsCount} </small> <small className="text"> Interviews: {job.interviews} </small>
              </div>
            </div>
            <div className="details-item__content" dangerouslySetInnerHTML={{ __html: job.description }} />
            <div className="project-info"><h6 className="project-info__title"> About the job </h6><div className="project-info-wrapper">
              <Info icon="las la-clock" label="Posted Job" value={d(job.createdAt)} />
              <Info icon="las la-calendar" label="Deadline" value={d(job.deadline)} />
              <Info icon="las la-brain" label="Experience level" value={skillLevelLabel(job.skillLevel)} />
              <Info icon="las la-briefcase" label="Project Scope" value={scope(job.projectScope)} />
              <Info icon="las la-map-marker" label="Job Longevity" value={longevity(job.jobLongevity)} />
              <Info icon="las la-map-marker" label="Location" value="100% Remote job" />
            </div></div>
            <div className="skill-expert-wrapper"><h6 className="skill-expert-wrapper__title"> Skill and expertise </h6><div className="skill-wrapper"><ul className="skill-list">{job.skillIds.map((sk: { _id: string; name: string }) => <li key={sk._id} className="skill-list__item"><span className="skill-list__link">{sk.name}</span></li>)}</ul></div></div>
            {job.questions?.length > 0 && (
              <div className="question-section"><div className="question-header"><h4>Job questions for freelancers</h4></div>
                <ul className="question-list">{job.questions.map((q: string, i: number) => <li key={i} className="question-item"><i className="las la-question-circle question-icon" /><span>{q}</span></li>)}</ul></div>
            )}
            <div className="job-share"><div className="blog-details__share d-flex align-items-center flex-wrap justify-content-start gap-2">
              <h6 className="social-share__title mb-0 me-sm-3 me-1 d-inline-block">Share :</h6>
              <ul className="social-list">{social.map(([h, i]) => <li key={i} className="social-list__item"><a href={h + url} className="social-list__link flex-center" target="_blank" rel="noreferrer"><i className={i} /></a></li>)}</ul>
            </div></div>
          </div>
          <div className="details-item"><div className="bid-wrapper">
            <div className="bid-wrapper__top"><h6 className="mb-0">{totalBidders} - Freelancers are bidding on this job</h6></div>
            <MoreBidders slug={slug} initial={bidders} total={totalBidders} />
          </div></div>
        </div></div>
        <div className="col-lg-4"><div className="sidebar-wrapper">
          <div className="sidebar-header sidebar-item">
            <div className="sidebar-header__content">
              <BidButton job={{ _id: job._id, title: job.title, customBudget: job.customBudget }} role={session?.role ?? null} profileComplete={profileComplete} alreadyBid={alreadyBid} curText={s.curText} budget={showAmount(job.budget, s.curSym)} policies={policies.map((p) => ({ slug: p.slug as string, title: p.dataValues.title }))} />
            </div>
            <div className="sidebar-header__shape"><img src={frontendImage('banner', banner.shape)} alt="" /></div>
          </div>
          <div className="sidebar-item buyer-info-item">
            <div className="top"><h6 className="sidebar-item__title"> About the Buyer </h6><div className="buyer-info">
              <div className="buyer-info__thumb"><img src={userImage(buyer.image)} alt="" /></div>
              <div className="buyer-info__content">
                <p className="buyer-info__name"> {`${buyer.firstname ?? ''} ${buyer.lastname ?? ''}`.trim()}</p>
                <div className="location"><div className="text"> {buyer.countryName} |</div><small>{buyer.address}</small></div>
                <ul className="review-rating-list">{Array.from({ length: Math.ceil(Math.min(buyer.avgRating ?? 0, 5)) }).map((_, i) => <li key={i} className="review-rating-list__item"> <i className="las la-star" /> </li>)}</ul>
                <div className="text-wrapper">
                  <p className="text"><span className="icon"><img src={asset('templates/basic/icons/check.png')} alt="" /></span> {buyerStats.percent.toFixed(2)}% Job Success</p>
                  <p className="text"><span className="icon"><img src={asset('templates/basic/icons/thumb.png')} alt="" /></span> {buyerStats.done} Complete Job</p>
                  <p className="text"><span className="icon"><img src={asset('templates/basic/icons/location.png')} alt="" /></span> {buyer.city}, {buyer.countryName}</p>
                </div>
              </div>
            </div></div>
            <div className="bottom"><div className="project-info-wrapper">
              <div className="project-info__item"><span className="project-info__icon"><i className="fa-solid fa-briefcase" /></span><div className="project-info__content"><p className="text"> Posted Job </p><span className="title"> {jobsPosted} jobs </span></div></div>
              <div className="project-info__item"><span className="project-info__icon"><i className="fa-solid fa-globe" /></span><div className="project-info__content"><p className="text"> Language </p><span className="title">English</span></div></div>
            </div></div>
          </div>
          <div className="sidebar-item"><h6 className="sidebar-item__title"> Verifications </h6><div className="sidebar-item__verify">
            {[['Verified Profile', `Verified ${buyer.firstname ?? ''} ${buyer.lastname ?? ''} profile`, true], ['Mobile Verified', buyer.sv ? 'Mobile verified users foster greater trust in our community' : 'Buyer foster greater trust in our community', !!buyer.sv], ['Email Verified', buyer.ev ? 'Verified users foster greater trust in our community' : 'Buyer foster greater trust in our community', !!buyer.ev]].map(([t, x, okv], i) => (
              <a key={t as string} href="#" className="verify-item"><span className="verify-item__icon" dangerouslySetInnerHTML={{ __html: VERIFY_SVGS[i] ?? '' }} /><div className="verify-item__content"><span className="verify-item__title"> {t as string} </span><p className={`verify-item__text${okv ? '' : ' unverified-text'}`}> {x as string} </p></div></a>
            ))}
          </div></div>
          <div className="sidebar-item"><h6 className="sidebar-item__title"> Top skill jobs </h6>
            <ul className="performer-list">{topSkills.length ? topSkills.map((k: { name: string; count: number }) => <li key={k.name} className="performer-list__item"><span className="text"> {k.name}</span><span className="text"> {k.count} </span></li>) : <div className="empty-message text-center py-5"><img src={asset('templates/basic/images/empty.png')} alt="empty" /><p className="text-muted mt-3">No top skill found!</p></div>}</ul>
          </div>
          <div className="sidebar-item"><h6 className="sidebar-item__title"> Similar job posts </h6>
            <ul className="job-list"><div className="similar-jobs-wrapper">
              {similar.length ? similar.map((j: { _id: string; slug: string; title: string; createdAt: string; deadline: string }) => (
                <li key={j._id} className="job-list__item"><a href={`/explore-job/${j.slug}`} className="job-list__link"> {strLimit(j.title, 30)}</a>
                  <div className="d-flex align-items-center gap-3"><span className="text"> {jobTimeDifference(j.createdAt, j.deadline)} </span><span className="text"> Deadline {d(j.deadline)} </span></div></li>
              )) : <div className="empty-message text-center py-5"><img src={asset('templates/basic/images/empty.png')} alt="empty" /><p className="text-muted mt-3">No job found!</p></div>}
            </div></ul>
            {totalSimilar > 5 && <div className="sidebar-item__btn text-center"><button className="btn-outline--base btn moreJobBtn"> Load more </button></div>}
          </div>
        </div></div>
      </div></div></div>
    </>
  );
}
void humanDiff;
