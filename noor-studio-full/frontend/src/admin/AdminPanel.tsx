import { useState, useRef, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, Category, GalleryItem } from '../context/DataContext';
import ContentEditor from './ContentEditor';
import './Admin.css';

const API = import.meta.env.VITE_API_URL || '';

type Tab = 'items' | 'categories' | 'content';

export default function AdminPanel() {
  const { token, username, logout } = useAuth();
  const { categories, items, loading, refresh, apiBase } = useData();
  const [tab, setTab] = useState<Tab>('items');
  const [filterCat, setFilterCat] = useState('all');

  // ── Item Form ──
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem,     setEditItem]     = useState<GalleryItem | null>(null);
  const [itemTitle,    setItemTitle]    = useState('');
  const [itemCat,      setItemCat]      = useState('');
  const [itemDesc,     setItemDesc]     = useState('');
  const [itemFile,     setItemFile]     = useState<File | null>(null);
  const [itemPreview,  setItemPreview]  = useState<string | null>(null);
  const [itemLoading,  setItemLoading]  = useState(false);
  const [itemErr,      setItemErr]      = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Category Form ──
  const [showCatForm, setShowCatForm] = useState(false);
  const [catId,       setCatId]       = useState('');
  const [catLabel,    setCatLabel]    = useState('');
  const [catErr,      setCatErr]      = useState('');
  const [catLoading,  setCatLoading]  = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };
  const filteredItems = filterCat === 'all' ? items : items.filter(i => i.categoryId === filterCat);

  // ── Reset item form ──
  const resetItemForm = () => {
    setEditItem(null); setItemTitle(''); setItemCat(''); setItemDesc('');
    setItemFile(null); setItemPreview(null); setItemErr('');
    if (fileRef.current) fileRef.current.value = '';
  };
  const openNewItem = () => { resetItemForm(); setShowItemForm(true); };
  const openEditItem = (item: GalleryItem) => {
    setEditItem(item); setItemTitle(item.title); setItemCat(item.categoryId);
    setItemDesc(item.description); setItemFile(null);
    setItemPreview(item.imageUrl ? `${apiBase}${item.imageUrl}` : null);
    setItemErr(''); setShowItemForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setItemFile(file);
    if (file) setItemPreview(URL.createObjectURL(file));
  };

  const handleItemSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setItemErr(''); setItemLoading(true);
    const fd = new FormData();
    fd.append('title', itemTitle);
    fd.append('categoryId', itemCat);
    fd.append('description', itemDesc);
    if (itemFile) fd.append('image', itemFile);

    const url    = editItem ? `${API}/api/admin/items/${editItem.id}` : `${API}/api/admin/items`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res  = await fetch(url, { method, headers: authHeaders, body: fd });
      const data = await res.json();
      if (!res.ok) { setItemErr(data.error || 'خطا'); setItemLoading(false); return; }
      refresh(); setShowItemForm(false); resetItemForm();
    } catch { setItemErr('خطای شبکه'); }
    setItemLoading(false);
  };

  const handleDeleteItem = async (id: string) => {
    await fetch(`${API}/api/admin/items/${id}`, { method: 'DELETE', headers: authHeaders });
    refresh(); setDeleteConfirm(null);
  };

  const handleCatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCatErr(''); setCatLoading(true);
    try {
      const res  = await fetch(`${API}/api/admin/categories`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: catId.trim().toLowerCase().replace(/\s+/g, '_'), label: catLabel }),
      });
      const data = await res.json();
      if (!res.ok) { setCatErr(data.error || 'خطا'); setCatLoading(false); return; }
      refresh(); setShowCatForm(false); setCatId(''); setCatLabel('');
    } catch { setCatErr('خطای شبکه'); }
    setCatLoading(false);
  };

  const handleDeleteCat = async (id: string) => {
    const res  = await fetch(`${API}/api/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders });
    const data = await res.json();
    if (!res.ok) { alert(data.error); setDeleteConfirm(null); return; }
    refresh(); setDeleteConfirm(null);
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">نور<span> ادمین</span></div>
        <nav className="sidebar-nav">
          <button className={tab === 'items'      ? 'active' : ''} onClick={() => setTab('items')}>
            <span>🖼</span> آیتم‌های گالری
          </button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>
            <span>🏷</span> دسته‌بندی‌ها
          </button>
          <button className={tab === 'content'    ? 'active' : ''} onClick={() => setTab('content')}>
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

            {loading ? (
              <div className="admin-loading">در حال بارگذاری...</div>
            ) : filteredItems.length === 0 ? (
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
                        ? { backgroundImage: `url(${apiBase}${item.imageUrl})` }
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
                      <button className="btn-del"  onClick={() => setDeleteConfirm(`item:${item.id}`)}>حذف</button>
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

              <div
                className="upload-zone"
                onClick={() => fileRef.current?.click()}
                style={itemPreview ? { backgroundImage: `url(${itemPreview})` } : {}}
              >
                {!itemPreview && (
                  <>
                    <span className="upload-icon">📸</span>
                    <p>کلیک کنید یا تصویر را اینجا بکشید</p>
                    <small>JPG، PNG، WEBP — حداکثر ۱۰MB</small>
                  </>
                )}
                {itemPreview && <div className="upload-overlay">تغییر تصویر</div>}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              <label>عنوان <span className="req">*</span></label>
              <input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="عنوان آیتم" required />

              <label>دسته‌بندی <span className="req">*</span></label>
              <select value={itemCat} onChange={e => setItemCat(e.target.value)} required>
                <option value="">انتخاب کنید...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>

              <label>توضیحات</label>
              <textarea value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="توضیح کوتاه (اختیاری)" rows={3} />

              {itemErr && <div className="err-msg">{itemErr}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowItemForm(false); resetItemForm(); }}>انصراف</button>
                <button type="submit" className="btn-save" disabled={itemLoading}>
                  {itemLoading ? 'در حال ذخیره...' : editItem ? 'ذخیره تغییرات' : 'افزودن آیتم'}
                </button>
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
              <small style={{ color: '#9e7e76', fontSize: '.78rem' }}>فقط حروف انگلیسی و خط تیره — مثلاً: family_event</small>
              {catErr && <div className="err-msg">{catErr}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCatForm(false)}>انصراف</button>
                <button type="submit" className="btn-save" disabled={catLoading}>
                  {catLoading ? 'در حال ذخیره...' : 'افزودن'}
                </button>
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
