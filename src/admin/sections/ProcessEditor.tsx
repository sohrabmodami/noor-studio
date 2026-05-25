import { useState } from 'react';
import { useData, type ProcessStep } from '../../context/DataContext';

export default function ProcessEditor() {
  const { data, update } = useData();
  const [section, setSection] = useState(data.processSection);
  const [steps, setSteps] = useState<ProcessStep[]>(data.process);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('processSection', section);
    update('process', steps);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setS = (field: keyof typeof section, val: string) =>
    setSection(prev => ({ ...prev, [field]: val }));

  const updateStep = (i: number, field: keyof ProcessStep, val: string) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">روند کار</h2>
        <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="ae-card">
        <span className="ae-label-sm">عنوان بخش</span>
        <div className="ae-fields-grid">
          <div className="af-group">
            <label className="af-label">برچسب کوچک (eyebrow)</label>
            <input className="af-input" value={section.eyebrow}
              onChange={e => setS('eyebrow', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">زیرعنوان سمت چپ</label>
            <input className="af-input" value={section.subtitle}
              onChange={e => setS('subtitle', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">متن عنوان (قبل از accent)</label>
            <input className="af-input" value={section.title}
              onChange={e => setS('title', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">بخش طلایی عنوان</label>
            <input className="af-input" value={section.titleAccent}
              onChange={e => setS('titleAccent', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">ادامه عنوان (بعد از accent)</label>
            <input className="af-input" value={section.titleAfter}
              onChange={e => setS('titleAfter', e.target.value)} />
          </div>
        </div>
      </div>

      {steps.map((step, i) => (
        <div key={i} className="ae-card">
          <span className="ae-label-sm">مرحله {step.num} — {step.label}</span>
          <div className="ae-fields-grid">
            <div className="af-group">
              <label className="af-label">شماره</label>
              <input className="af-input" value={step.num}
                onChange={e => updateStep(i, 'num', e.target.value)} />
            </div>
            <div className="af-group">
              <label className="af-label">برچسب کوتاه</label>
              <input className="af-input" value={step.label}
                onChange={e => updateStep(i, 'label', e.target.value)} />
            </div>
            <div className="af-group ae-col-span">
              <label className="af-label">عنوان</label>
              <input className="af-input" value={step.title}
                onChange={e => updateStep(i, 'title', e.target.value)} />
            </div>
            <div className="af-group ae-col-span">
              <label className="af-label">توضیحات</label>
              <textarea className="af-textarea" value={step.desc}
                onChange={e => updateStep(i, 'desc', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
