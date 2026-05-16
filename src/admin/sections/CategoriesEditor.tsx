import { useState } from 'react';
import { useData, type CategoryItem } from '../../context/DataContext';

export default function CategoriesEditor() {
  const { data, update } = useData();
  const [cats, setCats] = useState<CategoryItem[]>(data.categories);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('categories', cats);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateCat = (i: number, field: keyof CategoryItem, val: string) => {
    setCats(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const addCat = () => {
    setCats(prev => [...prev, { filter: 'new', label: 'جدید', count: '۰' }]);
  };

  const removeCat = (i: number) => {
    setCats(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">دسته‌بندی‌ها</h2>
        <div className="ae-actions-row">
          <button className="af-btn-ghost" onClick={addCat}>+ دسته جدید</button>
          <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
            {saved ? 'ذخیره شد ✓' : 'ذخیره'}
          </button>
        </div>
      </div>

      <div className="ae-card">
        <p className="ae-hint">«فیلتر» کلید داخلی است که در کارت‌ها استفاده می‌شود. تغییر آن ممکن است روی فیلترینگ تأثیر بگذارد.</p>
        <div className="ae-table">
          <div className="ae-table-head">
            <span>فیلتر (کلید)</span>
            <span>عنوان نمایشی</span>
            <span>تعداد</span>
            <span></span>
          </div>
          {cats.map((cat, i) => (
            <div key={i} className="ae-table-row">
              <input className="af-input af-input-sm" dir="ltr"
                value={cat.filter} onChange={e => updateCat(i, 'filter', e.target.value)} />
              <input className="af-input af-input-sm"
                value={cat.label} onChange={e => updateCat(i, 'label', e.target.value)} />
              <input className="af-input af-input-sm" style={{ width: 72 }}
                value={cat.count} onChange={e => updateCat(i, 'count', e.target.value)} />
              <button className="ae-del-btn" onClick={() => removeCat(i)} title="حذف">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
