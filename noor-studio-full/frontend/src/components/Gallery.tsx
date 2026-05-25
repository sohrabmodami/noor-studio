import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import './Gallery.css';

const BG_COLORS = [
  'linear-gradient(160deg,#f0cfc0 0%,#e8a090 100%)',
  'linear-gradient(160deg,#c9d8e0 0%,#a0b8c8 100%)',
  'linear-gradient(160deg,#d8c9e0 0%,#b8a0c8 100%)',
  'linear-gradient(160deg,#d8e0c9 0%,#b0c8a0 100%)',
  'linear-gradient(160deg,#e0d8c9 0%,#c8b8a0 100%)',
  'linear-gradient(160deg,#e0c9d8 0%,#c8a0b8 100%)',
];

export default function Gallery() {
  const { categories, items, loading, apiBase } = useData();
  const [active, setActive] = useState('all');

  const filtered = useMemo(() =>
    active === 'all' ? items : items.filter(i => i.categoryId === active),
    [items, active]
  );

  return (
    <section id="gallery" className="gallery-section">
      <div className="gallery-head">
        <div>
          <span className="section-eyebrow">نمونه کارها</span>
          <h2 className="section-title">جدیدترین <strong>پروژه‌ها</strong></h2>
        </div>
        <div className="cat-bar">
          <button
            className={`cat-btn${active === 'all' ? ' active' : ''}`}
            onClick={() => setActive('all')}
          >همه</button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-btn${active === c.id ? ' active' : ''}`}
              onClick={() => setActive(c.id)}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="gallery-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="gallery-empty">
          <span>📷</span>
          <p>هنوز آیتمی در این دسته‌بندی وجود ندارد.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((item, i) => (
            <div key={item.id} className="card-item">
              <div
                className="card-bg"
                style={
                  item.imageUrl
                    ? { backgroundImage: `url(${apiBase}${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: BG_COLORS[i % BG_COLORS.length] }
                }
              />
              <div className="card-overlay">
                <span className="card-cat">
                  {categories.find(c => c.id === item.categoryId)?.label || item.categoryId}
                </span>
                <span className="card-name">{item.title}</span>
                {item.description && <p className="card-desc">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
