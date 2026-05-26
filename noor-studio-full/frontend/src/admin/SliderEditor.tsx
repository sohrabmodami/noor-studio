import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

interface Slide { id: string; tag: string; imageUrl: string | null; order: number; }

export default function SliderEditor() {
  const { token } = useAuth();
  const [slides, setSlides]   = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null); // slide id being saved
  const [tags,    setTags]    = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadSlides = () => {
    setLoading(true);
    fetch(`${API}/api/slides`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSlides(data);
          const t: Record<string, string> = {};
          data.forEach((s: Slide) => { t[s.id] = s.tag; });
          setTags(t);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadSlides, []);

  const saveSlide = async (slide: Slide, file?: File | null) => {
    setSaving(slide.id);
    const fd = new FormData();
    fd.append('tag', tags[slide.id] ?? slide.tag);
    if (file) fd.append('image', file);
    await fetch(`${API}/api/admin/slides/${slide.id}`, {
      method: 'PUT', headers: authHeaders, body: fd,
    });
    loadSlides();
    setSaving(null);
  };

  const removeImage = async (slide: Slide) => {
    if (!confirm('تصویر این اسلاید حذف شود؟')) return;
    setSaving(slide.id);
    await fetch(`${API}/api/admin/slides/${slide.id}/image`, {
      method: 'DELETE', headers: authHeaders,
    });
    loadSlides();
    setSaving(null);
  };

  if (loading) return <div className="admin-loading">در حال بارگذاری...</div>;

  return (
    <div>
      <div className="admin-topbar">
        <h1>مدیریت اسلایدر</h1>
      </div>
      <p style={{ color: '#9e7e76', fontSize: '.85rem', marginBottom: '1.5rem' }}>
        برای هر اسلاید می‌توانید عکس آپلود کنید و برچسب متنی تنظیم کنید.
      </p>

      <div className="slides-list">
        {slides.map((slide, i) => (
          <div key={slide.id} className="slide-editor-card">
            <div className="slide-editor-num">{i + 1}</div>

            {/* Image area */}
            <div
              className="slide-editor-img"
              style={slide.imageUrl
                ? { backgroundImage: `url(${API}${slide.imageUrl})` }
                : { background: 'linear-gradient(145deg,#f0d5cc,#e0b8ac)' }
              }
              onClick={() => fileRefs.current[slide.id]?.click()}
            >
              {!slide.imageUrl && <span className="slide-editor-img-placeholder">📷<br /><small>کلیک برای آپلود عکس</small></span>}
              {slide.imageUrl && <div className="upload-overlay">تغییر عکس</div>}
              <input
                type="file" accept="image/*" style={{ display: 'none' }}
                ref={el => { fileRefs.current[slide.id] = el; }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) saveSlide(slide, file);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Controls */}
            <div className="slide-editor-controls">
              <div className="ce-field">
                <label>برچسب متنی</label>
                <input
                  value={tags[slide.id] ?? slide.tag}
                  onChange={e => setTags(t => ({ ...t, [slide.id]: e.target.value }))}
                  placeholder="مثلاً: عکاسی عروسی"
                />
              </div>
              <div className="slide-editor-btns">
                <button
                  className="btn-save"
                  disabled={saving === slide.id}
                  onClick={() => saveSlide(slide)}
                >
                  {saving === slide.id ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
                {slide.imageUrl && (
                  <button className="btn-del" onClick={() => removeImage(slide)}>
                    حذف عکس
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
