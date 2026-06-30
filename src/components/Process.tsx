import { useData } from '../context/DataContext';
import './Process.css';

export default function Process() {
  const { content, apiBase } = useData();
  const p = content?.process;
  const imageSrc = p?.imageUrl ? `${apiBase}${p.imageUrl}` : null;

  return (
    <section id="process" className="process-section">
      <div className="process-inner">
        <div className="process-media">
          {imageSrc ? (
            <img src={imageSrc} alt={p?.title || 'فرآیند کار استودیو نور'} loading="lazy" />
          ) : (
            <div className="process-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="process-copy">
          <span className="process-eyebrow">{p?.eyebrow ?? 'فرآیند کار'}</span>
          <h2>{p?.title ?? 'چرا عکاسی خانوادگی ارزشمند است؟'}</h2>
          <p>
            {p?.text ??
              'تصور کنید چند سال دیگر به عکس‌های خانوادگی نگاه می‌کنید؛ فقط یک تصویر معمولی نمی‌بینید، بلکه دریچه‌ای به خاطرات، عشق و لحظاتی است که تکرار نمی‌شوند.'}
          </p>
          <a className="process-btn" href={p?.btnLink || '#cta'}>
            {p?.btnText || 'ارتباط با ما'}
          </a>
        </div>
      </div>
    </section>
  );
}
