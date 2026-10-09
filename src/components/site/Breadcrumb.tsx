import { getContent } from '@/lib/cms';
import { frontendImage } from '@/lib/template';

/** Port of partials/breadcrumb.blade.php (data-background-image is applied by the template's main.js). */
export default async function Breadcrumb({ title, subTitle, toRoute }: { title: string; subTitle?: string; toRoute?: string }) {
  const c = await getContent('breadcrumb.content', true);
  return (
    <section className="breadcrumb bg-img" data-background-image={frontendImage('breadcrumb', c.image)}>
      <div className="container"><div className="row justify-content-center"><div className="col-lg-12">
        <div className="breadcrumb__wrapper">
          <h3 className="breadcrumb__title">{title}</h3>
          <ul className="breadcrumb__list">
            <li className="breadcrumb__item"><a href="/" className="breadcrumb__link"> Home</a></li>
            {subTitle && <><li className="breadcrumb__item"><i className="fas fa-angle-right" /></li><li className="breadcrumb__item"><a href={toRoute} className="breadcrumb__link"> {subTitle}</a></li></>}
            <li className="breadcrumb__item"><i className="fas fa-angle-right" /></li>
            <li className="breadcrumb__item"><span className="breadcrumb__item-text"> {title}</span></li>
          </ul>
        </div>
      </div></div></div>
    </section>
  );
}
