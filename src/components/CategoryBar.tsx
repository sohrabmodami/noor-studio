import { useRef } from 'react';
import { useData } from '../context/DataContext';

interface Props {
  active: string;
  onChange: (filter: string) => void;
}

export default function CategoryBar({ active, onChange }: Props) {
  const { data } = useData();
  const categories = data.categories;
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClick = (filter: string, idx: number) => {
    onChange(filter);
    chipRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div className="cats-bar">
      <span className="cats-label">دسته‌بندی</span>

      <div className="cats-scroller">
        {categories.map((cat, i) => (
          <button
            key={cat.filter}
            ref={el => { chipRefs.current[i] = el; }}
            className={`cats-chip${active === cat.filter ? ' active' : ''}`}
            onClick={() => handleClick(cat.filter, i)}
          >
            {cat.label}
            <span className="count">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="cats-toolbar">
        <button className="icon-btn" aria-label="فیلتر">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
        </button>
        <button className="icon-btn" aria-label="چینش">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
