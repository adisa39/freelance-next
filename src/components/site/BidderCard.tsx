import { BIDDER_SVGS } from '@/lib/svgs';
import { strLimit, userImage } from '@/lib/template';
import { stripTags } from '@/lib/format';

export type Bidder = { _id: string; username: string; firstname?: string; lastname?: string; image?: string; countryName?: string; tagline?: string; about?: string; avgRating?: number; badge?: { badgeName?: string } | null; jobSuccess: number; reviewsCount: number; totalEarned: number };
const fmtNum = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(2)}K` : n.toFixed(2));

/** Port of job_explore/freelancer.blade.php (one bid item) */
export default function BidderCard({ f }: { f: Bidder }) {
  return (
    <div className="bid-item">
      <a href={`/talent/details/${f.username}`} className="bid-item__thumb"><img src={userImage(f.image)} alt="" /></a>
      <div className="bid-item__content"><div className="bid-item__top"><div className="w-100">
        <div className="d-flex justify-content-between mx-auto align-items-center"><p className="bid-item__name mb-0"> {`${f.firstname ?? ''} ${f.lastname ?? ''}`.trim()}</p><a href={`/talent/details/${f.username}`} className="btn btn--base btn--xsm">View Profile</a></div>
        <div className="d-flex aligns-items-center gap-2 justify-content-start flex-wrap my-2">
          <div className="location"><p className="text"> <i className="las la-globe" />{f.countryName}</p></div>
          <p className="text"><span className="icon" dangerouslySetInnerHTML={{ __html: BIDDER_SVGS[0] ?? '' }} /><span> {f.jobSuccess.toFixed(2)}% Job Success</span></p>
          <span className="text"><span className="icon"><i className="las la-hand-holding-usd" /></span> Total Earned {fmtNum(f.totalEarned)}</span>
          <span className="text"><span className="icon" dangerouslySetInnerHTML={{ __html: BIDDER_SVGS[1] ?? '' }} /></span>
          {f.badge?.badgeName && <span className="text"><span className="icon"><i className="las la-award" /></span> {f.badge.badgeName}</span>}
        </div>
        <div className="freelancer-title">{f.tagline}</div>
        <ul className="review-rating-list"><ul className="review-rating-list">{Array.from({ length: Math.ceil(Math.min(f.avgRating ?? 0, 5)) }).map((_, i) => <li key={i} className="review-rating-list__item"> <i className="las la-star" /> </li>)}</ul><li className="rating-list__number"> ({f.reviewsCount} reviews)</li></ul>
      </div></div><p className="bid-item__desc">{strLimit(stripTags(f.about), 190)}</p></div>
    </div>
  );
}
