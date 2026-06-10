import { useEffect, useRef, useState } from 'react';
import type { CardData } from '../data/cards';

interface Props {
  card: CardData;
  hidden: boolean;
  revealIdx: number;
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" /><path d="M7 7h10v10" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export default function Card({ card, hidden, revealIdx }: Props) {
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const phRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), Math.min(revealIdx, 8) * 60);
          io.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [revealIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const ph = phRef.current;
    if (!ph) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ph.style.transform = `scale(1.07) translate(${x * -6}px, ${y * -6}px)`;
  };

  const handleMouseLeave = () => {
    if (phRef.current) phRef.current.style.transform = '';
  };

  const sizeClass = card.size === 'default' ? '' : ` size-${card.size}`;
  const hideClass = hidden ? ' hide-cat' : '';
  const revealClass = revealed ? ' revealed' : ' reveal-init';

  return (
    <article
      ref={ref}
      className={`card${sizeClass}${hideClass}${revealClass}`}
      data-cat={card.cat}
    >
      <div
        className="card-media"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {card.imageUrl
          ? <img ref={phRef as React.RefObject<HTMLImageElement>} src={card.imageUrl} alt={card.title} className="card-img" />
          : <div ref={phRef} className="ph" data-cat={card.cat} />
        }
        <span className="card-tag">
          <span className="dot" />
          {card.tagLabel}
        </span>
        <button
          className={`card-save${saved ? ' saved' : ''}`}
          aria-label="ذخیره"
          onClick={e => { e.preventDefault(); e.stopPropagation(); setSaved(s => !s); }}
        >
          <BookmarkIcon />
        </button>
        {card.quick && (
          <div className="card-quick">
            {card.quick.map((label, i) => (
              <button key={i} className={`qbtn${i === 0 ? ' dark' : ''}`}>{label}</button>
            ))}
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-title">{card.title}</div>
        <div className="card-desc">{card.desc}</div>
        <div className="card-row">
          {card.avatars ? (
            <div className="avatars">
              <span className="av" /><span className="av" />
            </div>
          ) : (
            <div className="card-meta">
              {card.meta?.map((m, i) => (
                <span key={i} className="card-pip">
                  {i === 0 && <ClockIcon />}
                  {i === 1 && card.meta![1].includes('قاب') === false && <PinIcon />}
                  {m}
                </span>
              ))}
            </div>
          )}
          <div className="card-arrow"><ArrowIcon /></div>
        </div>
      </div>
    </article>
  );
}
