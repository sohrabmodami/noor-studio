import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import './Hero.css';

// Warm gradient fallbacks for slides without an uploaded image.
const FALLBACKS = [
  'linear-gradient(135deg,#3a2520 0%,#c97b6b 60%,#e8a598 100%)',
  'linear-gradient(135deg,#2c1f1a 0%,#8a5a4d 55%,#d4a090 100%)',
  'linear-gradient(135deg,#4a2c24 0%,#b06a58 60%,#f0c9bd 100%)',
];

export default function Hero() {
  const { slides, content, apiBase } = useData();
  const [active, setActive] = useState(0);

  const count = slides.length;

  // Auto-advance every 5s (paused implicitly when there is 0/1 slide).
  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setActive(a => (a + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  // Keep active index valid if slides change.
  useEffect(() => {
    if (active >= count) setActive(0);
  }, [count, active]);

  const go = (i: number) => setActive((i + count) % count);

  const hero = content?.hero;

  return (
    <section id="hero" className="hero">
      <div className="hero-slider">
        <div className="slider-track">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`slide${i === active ? ' on' : ''}`}
              style={
                s.imageUrl
                  ? { backgroundImage: `linear-gradient(to top, rgba(20,12,10,.75) 0%, rgba(20,12,10,.15) 45%, rgba(20,12,10,.05) 100%), url(${apiBase}${s.imageUrl})` }
                  : { backgroundImage: `linear-gradient(to top, rgba(20,12,10,.55) 0%, rgba(20,12,10,.05) 60%), ${FALLBACKS[i % FALLBACKS.length]}` }
              }
            >
              <div className="slide-content">
                {s.tag && <span className="slide-badge">{s.tag}</span>}
                {s.title && <h1 className="slide-title">{s.title}</h1>}
                {s.subtitle && <p className="slide-subtitle">{s.subtitle}</p>}
                {hero && (hero.btnPrimaryText || hero.btnSecondaryText) && (
                  <div className="slide-btns">
                    {hero.btnPrimaryText && (
                      <a href={hero.btnPrimaryLink} className="btn-main">{hero.btnPrimaryText}</a>
                    )}
                    {hero.btnSecondaryText && (
                      <a href={hero.btnSecondaryLink} className="btn-outline-light">{hero.btnSecondaryText}</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {count === 0 && (
            <div className="slide on" style={{ background: FALLBACKS[0] }}>
              <div className="slide-content">
                <h1 className="slide-title">استودیو عکاسی نور</h1>
                <p className="slide-subtitle">برای افزودن اسلاید، وارد پنل مدیریت شوید.</p>
              </div>
            </div>
          )}
        </div>

        {count > 1 && (
          <>
            <button className="slider-arrow left" onClick={() => go(active - 1)} aria-label="قبلی">‹</button>
            <button className="slider-arrow right" onClick={() => go(active + 1)} aria-label="بعدی">›</button>
            <div className="slider-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === active ? ' on' : ''}`}
                  onClick={() => go(i)}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
