import { useState } from 'react';
import { useData, type NavItem } from '../../context/DataContext';

export default function MenuEditor() {
  const { data, update } = useData();
  const [navItems, setNavItems] = useState<NavItem[]>(data.header.navItems);
  const [ctaLabel, setCtaLabel] = useState(data.header.ctaLabel);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('header', { navItems, ctaLabel });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateItem = (i: number, field: keyof NavItem, val: string) => {
    setNavItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const addItem = () => {
    setNavItems(prev => [...prev, { href: '#', label: 'آیتم جدید' }]);
  };

  const removeItem = (i: number) => {
    setNavItems(prev => prev.filter((_, idx) => idx !== i));
  };

  const moveItem = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= navItems.length) return;
    const arr = [...navItems];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setNavItems(arr);
  };

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">منوی ناوبری</h2>
        <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="ae-card">
        <div className="af-group">
          <label className="af-label">متن دکمهٔ CTA (بالای صفحه)</label>
          <input
            className="af-input"
            value={ctaLabel}
            onChange={e => setCtaLabel(e.target.value)}
            placeholder="رزرو شوت ←"
          />
        </div>
      </div>

      <div className="ae-card">
        <div className="ae-list-header">
          <span className="ae-label-sm">آیتم‌های منو</span>
          <button className="af-btn-ghost" onClick={addItem}>+ افزودن آیتم</button>
        </div>
        <div className="ae-list">
          {navItems.map((item, i) => (
            <div key={i} className="ae-list-row">
              <div className="ae-row-order">
                <button className="ae-order-btn" onClick={() => moveItem(i, -1)} disabled={i === 0}>↑</button>
                <button className="ae-order-btn" onClick={() => moveItem(i, 1)} disabled={i === navItems.length - 1}>↓</button>
              </div>
              <div className="ae-row-fields">
                <input
                  className="af-input af-input-sm"
                  value={item.label}
                  onChange={e => updateItem(i, 'label', e.target.value)}
                  placeholder="عنوان"
                />
                <input
                  className="af-input af-input-sm"
                  value={item.href}
                  onChange={e => updateItem(i, 'href', e.target.value)}
                  placeholder="#بخش"
                  dir="ltr"
                />
              </div>
              <button className="ae-del-btn" onClick={() => removeItem(i)} title="حذف">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
