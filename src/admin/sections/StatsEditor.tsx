import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function StatsEditor() {
  const { data, update } = useData();
  const [lead, setLead] = useState(data.stats.lead);
  const [items, setItems] = useState(data.stats.items);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('stats', { lead, items });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateItem = (i: number, field: 'num' | 'label', val: string) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">آمار و دربارهٔ ما</h2>
        <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="ae-card">
        <div className="af-group">
          <label className="af-label">متن معرفی</label>
          <textarea className="af-textarea" value={lead}
            onChange={e => setLead(e.target.value)} />
        </div>
      </div>

      <div className="ae-card">
        <span className="ae-label-sm">آمارها</span>
        <div className="ae-stats-grid">
          {items.map((item, i) => (
            <div key={i} className="ae-stat-item">
              <div className="af-group">
                <label className="af-label">عدد</label>
                <input className="af-input" value={item.num}
                  onChange={e => updateItem(i, 'num', e.target.value)}
                  placeholder="۰۷" />
              </div>
              <div className="af-group">
                <label className="af-label">توضیح</label>
                <input className="af-input" value={item.label}
                  onChange={e => updateItem(i, 'label', e.target.value)}
                  placeholder="سال فعالیت" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
