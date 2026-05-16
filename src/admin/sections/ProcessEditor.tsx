import { useState } from 'react';
import { useData, type ProcessStep } from '../../context/DataContext';

export default function ProcessEditor() {
  const { data, update } = useData();
  const [steps, setSteps] = useState<ProcessStep[]>(data.process);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('process', steps);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
