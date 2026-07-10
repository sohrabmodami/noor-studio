import { useEffect, useState, useMemo } from 'react';
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
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const getCategoryIds = (item: { categoryId: string; categoryIds?: string[] }) =>
    item.categoryIds?.length ? item.categoryIds : [item.categoryId];

  const filtered = useMemo(() =>
    activeCategories.length === 0
      ? items
      : items.filter(i => getCategoryIds(i).some(id => activeCategories.includes(id))),
    [items, activeCategories]
  );

  const lightboxItem = lightboxIndex === null ? null : filtered[lightboxIndex] || null;
  const categoryLabel = (categoryId: string) =>
    categories.find(c => c.id === categoryId)?.label || categoryId;
  const categoryLabels = (item: { categoryId: string; categoryIds?: string[] }) =>
    getCategoryIds(item).map(categoryLabel).join('، ');
  const toggleCategory = (categoryId: string) => {
    setActiveCategories(selected =>
      selected.includes(categoryId)
        ? selected.filter(id => id !== categoryId)
        : [...selected, categoryId]
    );
  };
  const closeLightbox = () => setLightboxIndex(null);
  const goLightbox = (dir: number) => {
    if (filtered.length === 0) return;
    setLightboxIndex(i => {
      const current = i ?? 0;
      return (current + dir + filtered.length) % filtered.length;
    });
  };

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeCategories]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') goLightbox(1);
      if (event.key === 'ArrowRight') goLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('gallery-lock');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('gallery-lock');
    };
  }, [lightboxIndex, filtered.length]);

  return (
    <section id="gallery" className="gallery-section">
      <div className="gallery-head">
        <div>
          <span className="section-eyebrow">نمونه کارها</span>
          <h2 className="section-title">جدیدترین <strong>پروژه‌ها</strong></h2>
        </div>
        <div className="cat-bar">
          <button
            className={`cat-btn${activeCategories.length === 0 ? ' active' : ''}`}
            onClick={() => setActiveCategories([])}
          >همه</button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-btn${activeCategories.includes(c.id) ? ' active' : ''}`}
              onClick={() => toggleCategory(c.id)}
              aria-pressed={activeCategories.includes(c.id)}
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
            <button
              key={item.id}
              type="button"
              className="card-item"
              onClick={() => setLightboxIndex(i)}
              aria-label={`مشاهده تصویر ${item.title}`}
            >
              {item.imageUrl ? (
                <img className="card-image" src={`${apiBase}${item.imageUrl}`} alt="" loading="lazy" />
              ) : (
                <div className="card-fallback" style={{ background: BG_COLORS[i % BG_COLORS.length] }} />
              )}
              <div className="card-overlay">
                <span className="card-cat">
                  {categoryLabels(item)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxItem && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="نمایش تصویر گالری">
          <button className="lightbox-backdrop" type="button" onClick={closeLightbox} aria-label="بستن" />
          <div className="lightbox-panel">
            <button className="lightbox-close" type="button" onClick={closeLightbox} aria-label="بستن">×</button>
            <button className="lightbox-nav lightbox-prev" type="button" onClick={() => goLightbox(-1)} aria-label="تصویر قبلی">‹</button>
            <figure className="lightbox-figure">
              {lightboxItem.imageUrl ? (
                <img src={`${apiBase}${lightboxItem.imageUrl}`} alt={lightboxItem.title} />
              ) : (
                <div className="lightbox-fallback" style={{ background: BG_COLORS[(lightboxIndex ?? 0) % BG_COLORS.length] }} />
              )}
              <figcaption>{categoryLabels(lightboxItem)}</figcaption>
            </figure>
            <button className="lightbox-nav lightbox-next" type="button" onClick={() => goLightbox(1)} aria-label="تصویر بعدی">›</button>
          </div>
        </div>
      )}
    </section>
  );
}
