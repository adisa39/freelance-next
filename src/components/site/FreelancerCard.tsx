import { strLimit, userImage } from '@/lib/template';

export type FreelancerView = { _id: string; username: string; firstname?: string; lastname?: string; tagline?: string; image?: string; avgRating?: number; badge?: { badgeName?: string } | null; skillIds?: { _id: string; name: string }[] };

/** Port of partials/freelancer.blade.php */
export default function FreelancerCard({ f }: { f: FreelancerView }) {
  const rating = f.avgRating ?? 0;
  return (
    <div className="freelancer-item">
      {f.badge?.badgeName && <span className="freelancer-item__status text--base fs-12"><i className="las la-award" /> {f.badge.badgeName}</span>}
      <div className="freelancer-item__thumb"><img src={userImage(f.image)} alt={`${f.firstname} ${f.lastname}`} /></div>
      <div className="freelancer-item__content">
        <h6 className="freelancer-item__name"> {`${f.firstname ?? ''} ${f.lastname ?? ''}`.trim()}</h6>
        <span className="freelancer-item__designation">{strLimit(f.tagline ?? '', 30)}</span>
        {rating > 0 && (
          <ul className="text-list review-rating-list mb-0">
            {Array.from({ length: Math.ceil(Math.min(rating, 5)) }).map((_, i) => <li key={i} className="review-rating-list__item"> <i className="las la-star" /> </li>)}
            <li className="text-list__item">{rating}/5</li>
          </ul>
        )}
        <ul className="skill-list">{f.skillIds?.map((s) => <li key={s._id} className="skill-list__item"><span className="skill-list__link">{s.name}</span></li>)}</ul>
        <div className="freelancer-item__btn"><a href={`/talent/details/${f.username}`} className="btn--base btn btn--sm"> View Profile </a></div>
      </div>
    </div>
  );
}
