import { useEffect, useRef, useState } from 'react';
import { useData } from '../context/DataContext';

export default function HeroSlider() {
  const { data } = useData();
  const slides = data.slides;
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const go = (n: number) => setIdx(((n % slides.length) + slides.length) % slides.length);

  const startAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % slides.length), 4500);
  };

  useEffect(() => { startAuto(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [slides.length]);

  const handlePrev = () => { go(idx - 1); startAuto(); };
  const handleNext = () => { go(idx + 1); startAuto(); };

  const handleMouseEnter = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const handleMouseLeave = () => startAuto();
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { go(idx + (dx > 0 ? -1 : 1)); startAuto(); }
  };

  return (
    <section
      className="slider"
      id="hero"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="slider-track">
        {slides.map((slide, i) => (
          <article key={i} className={`slide${i === idx ? ' is-active' : ''}`}>
            {slide.imageUrl
              ? <img src={slide.imageUrl} alt={slide.tag} className="slide-img" />
              : <div className="ph" data-cat={slide.cat} />
            }
            <div className="slide-content">
              <span className="slide-tag">
                <span className="dot" />
                {slide.tag}
              </span>
              <h1>
                {slide.title}<b>{slide.titleAccent}</b>{slide.titleAfter}
              </h1>
              <p className="slide-desc">{slide.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <button className="slider-arrow slider-arrow-prev" onClick={handlePrev} aria-label="قبلی">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button className="slider-arrow slider-arrow-next" onClick={handleNext} aria-label="بعدی">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="slider-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot${i === idx ? ' active' : ''}`}
            onClick={() => { go(i); startAuto(); }}
            aria-label={`اسلاید ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
