import { useData } from '../context/DataContext';

export default function CTA() {
  const { data } = useData();
  const c = data.contact;

  return (
    <section className="cta" id="contact">
      <h2>{c.ctaHeading.split('\n').map((line, i) => (
        i === 0 ? <span key={i}>{line}<br /></span> : <span key={i}>{line}</span>
      ))}</h2>
      <div className="cta-right">
        <p>{c.ctaBody}</p>
        <div className="cta-actions">
          <a href={`mailto:${c.email}`} className="cta-btn-primary">{c.ctaBtnPrimary}</a>
          <a href="#contact" className="cta-btn-secondary">{c.ctaBtnSecondary}</a>
        </div>
      </div>
    </section>
  );
}
