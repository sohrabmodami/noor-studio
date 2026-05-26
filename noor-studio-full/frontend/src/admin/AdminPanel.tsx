import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, Category, GalleryItem } from '../context/DataContext';
import ContentEditor from './ContentEditor';
import './Admin.css';

type Tab = 'items' | 'categories' | 'content';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AdminPanel() {
  const { username, logout } = useAuth();
  const { categories, items, saveCategories, saveItems } = useData();
  const [tab, setTab] = useState<Tab>('items');
  const [filterCat, setFilterCat] = useState('all');

  // ── Item Form ──
  const [showItemForm, setShowItemForm]   = useState(false);
  const [editItem,     setEditItem]       = useState<GalleryItem | null>(null);
  const [itemTitle,    setItemTitle]      = useState('');
  const [itemCat,      setItemCat]        = useState('');
  const [itemDesc,     setItemDesc]       = useState('');
  const [itemUrl,      setItemUrl]        = useState('');
  const [itemErr,      setItemErr]        = useState('');

  // ── Category Form ──
  const [showCatForm, setShowCatForm] = useState(false);
  const [catId,       setCatId]       = useState('');
  const [catLabel,    setCatLabel]    = useState('');
  const [catErr,      setCatErr]      = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = filterCat === 'all' ? items : items.filter(i => i.categoryId === filterCat);

  // ── Reset item form ──
  const resetItemForm = () => {
    setEditItem(null); setItemTitle(''); setItemCat('');
    setItemDesc(''); setItemUrl(''); setItemErr('');
  };
  const openNewItem = () => { resetItemForm(); setShowItemForm(true); };
  const openEditItem = (item: GalleryItem) => {
    setEditItem(item); setItemTitle(item.title); setItemCat(item.categoryId);
    setItemDesc(item.description); setItemUrl(item.imageUrl || ''); setItemErr('');
    setShowItemForm(true);
  };

  const handleItemSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) { setItemErr('عنوان الزامی است'); return; }
    if (!itemCat)          { setItemErr('دسته‌بندی را انتخاب کنید'); return; }

    if (editItem) {
      saveItems(items.map(i => i.id === editItem.id
        ? { ...i, title: itemTitle, categoryId: itemCat, description: itemDesc, imageUrl: itemUrl || null }
        : i
      ));
    } else {
      const newItem: GalleryItem = {
        id: uid(), title: itemTitle, categoryId: itemCat,
        description: itemDesc, imageUrl: itemUrl || null, createdAt: new Date().toISOString(),
      };
      saveItems([...items, newItem]);
    }
    setShowItemForm(false); resetItemForm();
  };

  const handleDeleteItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
    setDeleteConfirm(null);
  };

  const handleCatSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = catId.trim().toLowerCase().replace(/\s+/g, '_');
    if (!catLabel.trim()) { setCatErr('نام الزامی است'); return; }
    if (!id)              { setCatErr('شناسه الزامی است'); return; }
    if (categories.find(c => c.id === id)) { setCatErr('این شناسه قبلاً وجود دارد'); return; }
    saveCategories([...categories, { id, label: catLabel }]);
    setShowCatForm(false); setCatId(''); setCatLabel(''); setCatErr('');
  };

  const handleDeleteCat = (id: string) => {
    if (items.some(i => i.categoryId === id)) {
      alert('ابتدا آیتم‌های این دسته را حذف کنید');
      setDeleteConfirm(null); return;
    }
    saveCategories(categories.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">نور<span> ادمین</span></div>
        <nav className="sidebar-nav">
          <button className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>
            <span>🖼</span> آیتم‌های گالری
          </button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>
            <span>🏷</span> دسته‌بندی‌ها
          </button>
          <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
            <span>✏️</span> محتوای سایت
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">👤 {username}</div>
          <button className="logout-btn" onClick={logout}>خروج</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* ════ CONTENT TAB ════ */}
        {tab === 'content' && <ContentEditor />}

        {/* ════ ITEMS TAB ════ */}
        {tab === 'items' && (
          <div>
            <div className="admin-topbar">
              <h1>آیتم‌های گالری</h1>
              <button className="btn-add" onClick={openNewItem}>+ افزودن آیتم</button>
            </div>

            <div className="admin-filter-bar">
              <button className={`acat-btn${filterCat === 'all' ? ' on' : ''}`} onClick={() => setFilterCat('all')}>
                همه ({items.length})
              </button>
              {categories.map(c => (
                <button key={c.id} className={`acat-btn${filterCat === c.id ? ' on' : ''}`} onClick={() => setFilterCat(c.id)}>
                  {c.label} ({items.filter(i => i.categoryId === c.id).length})
                </button>
              ))}
            </div>

            {filteredItems.length === 0 ? (
              <div className="admin-empty">
                <span>📭</span><p>هیچ آیتمی یافت نشد</p>
                <button className="btn-add" onClick={openNewItem}>+ افزودن اولین آیتم</button>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.map(item => (
                  <div key={item.id} className="item-card">
                    <div
                      className="item-thumb"
                      style={item.imageUrl
                        ? { backgroundImage: `url(${item.imageUrl})` }
                        : { background: 'linear-gradient(135deg,#f5ddd6,#e8c5bc)' }}
                    >
                      {!item.imageUrl && <span>📷</span>}
                    </div>
                    <div className="item-info">
                      <div className="item-cat-badge">
                        {categories.find(c => c.id === item.categoryId)?.label || item.categoryId}
                      </div>
                      <div className="item-title">{item.title}</div>
                      {item.description && <p className="item-desc">{item.description}</p>}
                    </div>
                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => openEditItem(item)}>ویرایش</button>
                      <button className="btn-del" onClick={() => setDeleteConfirm(`item:${item.id}`)}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ CATEGORIES TAB ════ */}
        {tab === 'categories' && (
          <div>
            <div className="admin-topbar">
              <h1>دسته‌بندی‌ها</h1>
              <button className="btn-add" onClick={() => setShowCatForm(true)}>+ افزودن دسته‌بندی</button>
            </div>
            <div className="cat-list">
              {categories.length === 0 && (
                <div className="admin-empty"><span>🏷</span><p>هنوز دسته‌بندی‌ای ندارید</p></div>
              )}
              {categories.map(c => {
                const count = items.filter(i => i.categoryId === c.id).length;
                return (
                  <div key={c.id} className="cat-row">
                    <div className="cat-row-info">
                      <span className="cat-row-label">{c.label}</span>
                      <span className="cat-row-id">ID: {c.id}</span>
                    </div>
                    <div className="cat-row-count">{count} آیتم</div>
                    <button
                      className="btn-del"
                      disabled={count > 0}
                      title={count > 0 ? 'ابتدا آیتم‌های این دسته را حذف کنید' : ''}
                      onClick={() => setDeleteConfirm(`cat:${c.id}`)}
                    >حذف</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ════ ITEM FORM MODAL ════ */}
      {showItemForm && (
        <div className="modal-backdrop" onClick={() => { setShowItemForm(false); resetItemForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}</h2>
              <button onClick={() => { setShowItemForm(false); resetItemForm(); }}>✕</button>
            </div>
            <form onSubmit={handleItemSubmit} className="modal-form">

              <label>عنوان <span className="req">*</span></label>
              <input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="عنوان آیتم" required />

              <label>دسته‌بندی <span className="req">*</span></label>
              <select value={itemCat} onChange={e => setItemCat(e.target.value)} required>
                <option value="">انتخاب کنید...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>

              <label>لینک تصویر</label>
              <input
                value={itemUrl} onChange={e => setItemUrl(e.target.value)}
                placeholder="https://... (اختیاری)" dir="ltr"
              />
              {itemUrl && (
                <div className="img-preview-wrap">
                  <img src={itemUrl} alt="preview" className="img-preview"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}

              <label>توضیحات</label>
              <textarea value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="توضیح کوتاه (اختیاری)" rows={3} />

              {itemErr && <div className="err-msg">{itemErr}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowItemForm(false); resetItemForm(); }}>انصراف</button>
                <button type="submit" className="btn-save">{editItem ? 'ذخیره تغییرات' : 'افزودن آیتم'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ CATEGORY FORM MODAL ════ */}
      {showCatForm && (
        <div className="modal-backdrop" onClick={() => setShowCatForm(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>افزودن دسته‌بندی</h2>
              <button onClick={() => setShowCatForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCatSubmit} className="modal-form">
              <label>نام فارسی <span className="req">*</span></label>
              <input value={catLabel} onChange={e => setCatLabel(e.target.value)} placeholder="مثلاً: عروسی" required />
              <label>شناسه (ID) <span className="req">*</span></label>
              <input value={catId} onChange={e => setCatId(e.target.value)} placeholder="مثلاً: wedding" required dir="ltr" />
              <small style={{ color: '#9e7e76', fontSize: '.78rem' }}>فقط حروف انگلیسی — مثلاً: family_event</small>
              {catErr && <div className="err-msg">{catErr}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCatForm(false)}>انصراف</button>
                <button type="submit" className="btn-save">افزودن</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ DELETE CONFIRM ════ */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm confirm-modal" onClick={e => e.stopPropagation()}>
            <span className="confirm-icon">⚠️</span>
            <h3>آیا مطمئن هستید؟</h3>
            <p>این عمل قابل بازگشت نیست.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>انصراف</button>
              <button className="btn-del-confirm" onClick={() => {
                const [type, id] = deleteConfirm.split(':');
                if (type === 'item') handleDeleteItem(id);
                else handleDeleteCat(id);
              }}>بله، حذف کن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
