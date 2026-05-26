import './CTA.css';
import { useSiteContent } from '../context/SiteContentContext';

export default function CTA() {
  const { content: { cta } } = useSiteContent();
  return (
    <section id="cta" className="cta-section">
      <div className="cta-box">
        <h2>{cta.heading}<br /><strong>{cta.headingBold}</strong></h2>
        <p>{cta.desc}</p>
        <div className="cta-btns">
          <a href={cta.emailHref} className="btn-white">{cta.emailLabel}</a>
          <a href={cta.instagramHref} target="_blank" rel="noreferrer" className="btn-white-out">{cta.instagramLabel}</a>
        </div>
      </div>
    </section>
  );
}
