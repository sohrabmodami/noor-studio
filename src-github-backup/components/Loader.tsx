import { useEffect, useState } from 'react';

export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`loader${hidden ? ' hidden' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="1" />
        <g fill="currentColor">
          <polygon className="blade" points="60,60 84,18 96,42" transform="rotate(0 60 60)" />
          <polygon className="blade" points="60,60 96,42 96,78" transform="rotate(60 60 60)" />
          <polygon className="blade" points="60,60 96,78 84,102" transform="rotate(120 60 60)" />
          <polygon className="blade" points="60,60 84,102 36,102" transform="rotate(180 60 60)" />
          <polygon className="blade" points="60,60 36,102 24,78" transform="rotate(240 60 60)" />
          <polygon className="blade" points="60,60 24,78 24,42" transform="rotate(300 60 60)" />
        </g>
      </svg>
    </div>
  );
}
