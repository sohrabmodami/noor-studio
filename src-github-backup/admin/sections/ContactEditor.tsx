import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function ContactEditor() {
  const { data, update } = useData();
  const [form, setForm] = useState(data.contact);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('contact', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (field: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">تماس و CTA</h2>
        <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="ae-card">
        <div className="af-group">
          <label className="af-label">ایمیل تماس</label>
          <input className="af-input" dir="ltr" value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="hello@noor.studio" />
        </div>
      </div>

      <div className="ae-card">
        <span className="ae-label-sm">بخش CTA</span>
        <div className="ae-fields-grid">
          <div className="af-group ae-col-span">
            <label className="af-label">عنوان اصلی (از \n برای شکست خط استفاده کنید)</label>
            <textarea className="af-textarea" value={form.ctaHeading}
              onChange={e => set('ctaHeading', e.target.value)} />
          </div>
          <div className="af-group ae-col-span">
            <label className="af-label">متن توضیحی</label>
            <textarea className="af-textarea" value={form.ctaBody}
              onChange={e => set('ctaBody', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">متن دکمه اول (ایمیل)</label>
            <input className="af-input" dir="ltr" value={form.ctaBtnPrimary}
              onChange={e => set('ctaBtnPrimary', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">متن دکمه دوم</label>
            <input className="af-input" value={form.ctaBtnSecondary}
              onChange={e => set('ctaBtnSecondary', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
