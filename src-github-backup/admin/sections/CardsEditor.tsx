import { useState } from 'react';
import { useData } from '../../context/DataContext';
import type { CardData, CardSize } from '../../data/cards';

const SIZES: CardSize[] = ['default', 'sm', 'lg', 'xl', 'half'];

function nextId(cards: CardData[]) {
  return cards.length ? Math.max(...cards.map(c => c.id)) + 1 : 1;
}

function emptyCard(id: number): CardData {
  return { id, cat: 'portrait', size: 'default', title: 'پروژه جدید', desc: '', tagLabel: 'پرتره' };
}

export default function CardsEditor() {
  const { data, update } = useData();
  const [cards, setCards] = useState<CardData[]>(data.cards);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update('cards', cards);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateCard = (id: number, patch: Partial<CardData>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const addCard = () => {
    const id = nextId(cards);
    setCards(prev => [...prev, emptyCard(id)]);
    setExpanded(id);
  };

  const removeCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setExpanded(null);
  };

  const moveCard = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cards.length) return;
    const arr = [...cards];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setCards(arr);
  };

  const cats = data.categories.filter(c => c.filter !== 'all').map(c => c.filter);

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">پروژه‌ها / کارت‌ها</h2>
        <div className="ae-actions-row">
          <button className="af-btn-ghost" onClick={addCard}>+ کارت جدید</button>
          <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
            {saved ? 'ذخیره شد ✓' : 'ذخیره'}
          </button>
        </div>
      </div>

      <div className="ae-accordion">
        {cards.map((card, i) => (
          <div key={card.id} className="ae-acc-item">
            <div className="ae-acc-trigger-wrap">
              <div className="ae-row-order">
                <button className="ae-order-btn" onClick={() => moveCard(i, -1)} disabled={i === 0}>↑</button>
                <button className="ae-order-btn" onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1}>↓</button>
              </div>
              <button
                className="ae-acc-trigger ae-acc-trigger-flex"
                onClick={() => setExpanded(expanded === card.id ? null : card.id)}
              >
                <span className="ae-cat-badge" data-cat={card.cat}>{card.cat}</span>
                <span className="ae-acc-preview">{card.title}</span>
                <span className="ae-size-badge">{card.size}</span>
                <span className="ae-acc-arrow">{expanded === card.id ? '▲' : '▼'}</span>
              </button>
            </div>

            {expanded === card.id && (
              <div className="ae-acc-body">
                <div className="ae-fields-grid">
                  <div className="af-group">
                    <label className="af-label">دسته‌بندی</label>
                    <select className="af-select" value={card.cat}
                      onChange={e => updateCard(card.id, { cat: e.target.value as CardData['cat'] })}>
                      {cats.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="af-group">
                    <label className="af-label">اندازه</label>
                    <select className="af-select" value={card.size}
                      onChange={e => updateCard(card.id, { size: e.target.value as CardSize })}>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">عنوان</label>
                    <input className="af-input" value={card.title}
                      onChange={e => updateCard(card.id, { title: e.target.value })} />
                  </div>
                  <div className="af-group">
                    <label className="af-label">برچسب دسته</label>
                    <input className="af-input" value={card.tagLabel}
                      onChange={e => updateCard(card.id, { tagLabel: e.target.value })} />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">توضیحات</label>
                    <textarea className="af-textarea" value={card.desc}
                      onChange={e => updateCard(card.id, { desc: e.target.value })} />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">آدرس تصویر (URL) — اختیاری</label>
                    <input className="af-input" dir="ltr" value={card.imageUrl || ''}
                      onChange={e => updateCard(card.id, { imageUrl: e.target.value || undefined })}
                      placeholder="https://example.com/photo.jpg" />
                    {card.imageUrl && (
                      <img src={card.imageUrl} alt="" className="ae-img-preview" />
                    )}
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">دکمه‌های سریع (هر آیتم در یک خط)</label>
                    <textarea className="af-textarea af-textarea-sm"
                      value={(card.quick || []).join('\n')}
                      onChange={e => updateCard(card.id, {
                        quick: e.target.value ? e.target.value.split('\n') : undefined
                      })}
                      placeholder="دیدن پروژه ←" />
                  </div>
                  <div className="af-group ae-col-span">
                    <label className="af-label">متاداده (هر آیتم در یک خط)</label>
                    <textarea className="af-textarea af-textarea-sm"
                      value={(card.meta || []).join('\n')}
                      onChange={e => updateCard(card.id, {
                        meta: e.target.value ? e.target.value.split('\n') : undefined
                      })}
                      placeholder="اردیبهشت ۱۴۰۵" />
                  </div>
                  <div className="af-group">
                    <label className="af-label">آواتار</label>
                    <label className="ae-toggle">
                      <input type="checkbox" checked={!!card.avatars}
                        onChange={e => updateCard(card.id, { avatars: e.target.checked || undefined })} />
                      <span>نمایش آواتار به‌جای متا</span>
                    </label>
                  </div>
                </div>
                <button className="ae-del-row-btn" onClick={() => removeCard(card.id)}>
                  حذف این کارت
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
