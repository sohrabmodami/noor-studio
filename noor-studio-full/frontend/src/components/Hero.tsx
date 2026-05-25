import { useState, useEffect, useRef } from 'react';
import './Hero.css';

const slides = [
  {
    tag: 'عکاسی عروسی',
    bg: 'linear-gradient(145deg,#e8c5bc 0%,#d4a090 50%,#c9907e 100%)',
  },
  {
    tag: 'پرتره حرفه‌ای',
    bg: 'linear-gradient(145deg,#dcc4bb 0%,#c9a898 50%,#b89080 100%)',
  },
  {
    tag: 'عکاسی خانوادگی',
    bg: 'linear-gradient(145deg,#f0d5cc 0%,#e0b8ac 50%,#d4a090 100%)',
  },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef(0);

  const go = (n: number) => setIdx(((n % slides.length) + slides.length) % slides.length);

  const startAuto = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIdx(i => (i + 1) % slides.length), 4500);
  };

  useEffect(() => {
    startAuto();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  return (
    <section id="hero" className="hero">
      <div
        className="hero-slider"
        onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 40) { go(idx + (dx > 0 ? -1 : 1)); startAuto(); }
        }}
      >
        {slides.map((s, i) => (
          <div key={i} className={`hero-slide${i === idx ? ' active' : ''}`}>
            <div className="hero-slide-bg" style={{ background: s.bg }} />
            <div className="hero-slide-overlay" />
          </div>
        ))}

        {/* Glass box */}
        <div className="hero-glass">
          <span className="hero-glass-dot" />
          <div className="hero-glass-text">
            <span className="hero-glass-label">استودیو نور</span>
            <span className="hero-glass-tag">{slides[idx].tag}</span>
          </div>
        </div>

        {/* Arrows */}
        <button className="hero-arrow hero-arrow-r" onClick={() => { go(idx - 1); startAuto(); }} aria-label="قبلی">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button className="hero-arrow hero-arrow-l" onClick={() => { go(idx + 1); startAuto(); }} aria-label="بعدی">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button key={i} className={`hero-dot${i === idx ? ' active' : ''}`}
              onClick={() => { go(i); startAuto(); }} />
          ))}
        </div>
      </div>
    </section>
  );
}
