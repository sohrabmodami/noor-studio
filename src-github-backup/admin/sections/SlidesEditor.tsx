import { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { Slide } from '../../data/slides';

const emptySlide = (): Slide => ({
  cat: 'portrait',
  tag: 'برچسب جدید',
  title: 'عنوان ',
  titleAccent: 'برجسته',
  titleAfter: '.',
  desc: 'توضیحات اسلاید.',
  meta: [],
  imageUrl: '',
});

export default function SlidesEditor() {
  const { data, update } = useData();
  const [slides, setSlides] = useState<Slide[]>(data.slides);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('slides', slides);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSlide = (i: number, field: keyof Slide, val: string | string[]) => {
    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const addSlide = () => {
    setSlides(prev => [...prev, emptySlide()]);
    setExpanded(slides.length);
  };

  const removeSlide = (i: number) => {
    setSlides(prev => prev.filter((_, idx) => idx !== i));
    setExpanded(null);
  };

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">اسلایدر هیرو</h2>
        <div className="ae-actions-row">
          <button className="af-btn-ghost" onClick={addSlide}>+ اسلاید جدید</button>
          <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
            {saved ? 'ذخیره شد ✓' : 'ذخیره'}
          </button>
        </div>
      </div>

      <div className="ae-accordion">
        {slides.map((slide, i) => (
          <div key={i} className="ae-acc-item">
            <button
              className="ae-acc-trigger"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="ae-acc-num">اسلاید {i + 1}</span>
              <span className="ae-acc-preview">{slide.title}{slide.titleAccent}</span>
              <span className="ae-acc-arrow">{expanded === i ? '▲' : '▼'}</span>
            </button>

            {expanded === i && (
              <div className="ae-acc-body">
                <div className="ae-fields-grid">
                  <div className="af-group">
                    <label className="af-label">دسته‌بندی (cat)</label>
                    <input className="af-input" dir="ltr" value={slide.cat}
                      onChange={e => updateSlide(i, 'cat', e.target.value)} />
                  </div>
                  <div className="af-group">
                    <label className="af-label">برچسب بالا</label>
                    <input className="af-input" value={slide.tag}
                      onChange={e => updateSlide(i, 'tag', e.target.value)} />
                  </div>
                  <div className="af-group">
                    <label className="af-label">ابتدای عنوان</label>
                    <input className="af-input" value={slide.title}
                      onChange={e => updateSlide(i, 'title', e.target.value)} />
                  </div>
                  <div className="af-group">
                    <label className="af-label">بخش برجسته عنوان</label>
                    <input className="af-input" value={slide.titleAccent}
                      onChange={e => updateSlide(i, 'titleAccent', e.target.value)} />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">ادامه عنوان</label>
                    <input className="af-input" value={slide.titleAfter}
                      onChange={e => updateSlide(i, 'titleAfter', e.target.value)} />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">توضیحات</label>
                    <textarea className="af-textarea" value={slide.desc}
                      onChange={e => updateSlide(i, 'desc', e.target.value)} />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">متاداده (هر آیتم در یک خط)</label>
                    <textarea className="af-textarea af-textarea-sm"
                      value={slide.meta.join('\n')}
                      onChange={e => updateSlide(i, 'meta', e.target.value.split('\n'))}
                      dir="ltr"
                    />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">آدرس تصویر (URL)</label>
                    <input className="af-input" dir="ltr" value={slide.imageUrl || ''}
                      onChange={e => updateSlide(i, 'imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg" />
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt="" className="ae-img-preview" />
                    )}
                  </div>
                </div>
                <button className="ae-del-row-btn" onClick={() => removeSlide(i)}>
                  حذف این اسلاید
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
