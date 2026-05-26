import './Process.css';
import { useSiteContent } from '../context/SiteContentContext';

export default function Process() {
  const { content: { process: p } } = useSiteContent();
  return (
    <section id="process" className="process-section">
      <div className="process-inner">
        <div className="section-head">
          <span className="section-eyebrow">{p.eyebrow}</span>
          <h2 className="section-title">{p.title}<strong>{p.titleBold}</strong></h2>
        </div>
        <div className="process-cards">
          {p.steps.map(s => (
            <div key={s.n} className="process-card">
              <div className="p-num">{s.n}</div>
              <div className="p-title">{s.title}</div>
              <p className="p-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
