import { jobTimeDifference, skillLevelLabel, stripTags } from '@/lib/format';
import { showAmount, strLimit } from '@/lib/template';

export type JobView = { _id: string; slug: string; title: string; budget: number; customBudget: boolean; skillLevel: number; description: string; createdAt: string; deadline: string; bidsCount: number; skillIds?: { _id: string; name: string }[] };

/** Port of job_explore/job.blade.php (one card) */
export default function JobCard({ job }: { job: JobView }) {
  return (
    <div className="expert-developer">
      <div className="expert-developer__top">
        <div className="left">
          <div className="left__top"><h6 className="expert-developer__title"><a href={`/explore-job/${job.slug}`}>{strLimit(job.title, 100)}</a></h6></div>
          <span className="expert-developer__time">{jobTimeDifference(job.createdAt, job.deadline)}</span>
          <div className="job-information-area">
            <div><span className="title"> Budget <sup> [{job.customBudget ? 'Customized' : 'Fixed'}] </sup></span><p className="text"> {showAmount(job.budget)} </p></div>
            <div><span className="title"> Experience level </span><p className="text">{skillLevelLabel(job.skillLevel)}</p></div>
          </div>
        </div>
        <div className="right">
          <a href={`/explore-job/${job.slug}`} target="_blank" rel="noreferrer" className="btn btn--base btn--xsm"> Bid Now </a>
          <p className="total-bid mt-1"><span className="text"> Bids: {job.bidsCount} </span></p>
        </div>
      </div>
      <p className="expert-developer__desc">{strLimit(stripTags(job.description), 230)}</p>
      <ul className="skill-list justify-content-start">{job.skillIds?.map((s) => <li key={s._id} className="skill-list__item"><a href="#" className="skill-list__link">{s.name}</a></li>)}</ul>
    </div>
  );
}
