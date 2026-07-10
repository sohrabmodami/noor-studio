import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, GalleryItem, Slide, SiteContent } from '../context/DataContext';
import './Admin.css';

const API = import.meta.env.VITE_API_URL || '';

type Tab = 'slides' | 'items' | 'categories' | 'content';

export default function AdminPanel() {
  const { token, username, logout, handleAuthError } = useAuth();
  const { categories, items, slides, content, logoUrl, loading, refresh, apiBase } = useData();
  const [tab, setTab] = useState<Tab>('slides');
  const [filterCats, setFilterCats] = useState<string[]>([]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── Item Form ──
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCats, setItemCats] = useState<string[]>([]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemPreview, setItemPreview] = useState<string | null>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemErr, setItemErr] = useState('');
  const [itemCatSearch, setItemCatSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Slide Form ──
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [editSlide, setEditSlide] = useState<Slide | null>(null);
  const [slideTag, setSlideTag] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [slidePreview, setSlidePreview] = useState<string | null>(null);
  const [slideLoading, setSlideLoading] = useState(false);
  const [slideErr, setSlideErr] = useState('');
  const slideFileRef = useRef<HTMLInputElement>(null);

  // ── Category Form ──
  const [showCatForm, setShowCatForm] = useState(false);
  const [catId, setCatId] = useState('');
  const [catLabel, setCatLabel] = useState('');
  const [catErr, setCatErr] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // ── Logo ──
  const logoFileRef = useRef<HTMLInputElement>(null);
  const processImageRef = useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [processImageBusy, setProcessImageBusy] = useState(false);

  // ── Content Form ──
  const [form, setForm] = useState<SiteContent | null>(null);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentMsg, setContentMsg] = useState('');
  useEffect(() => { if (content) setForm(structuredClone(content)); }, [content]);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getItemCategoryIds = (item: GalleryItem) => item.categoryIds?.length ? item.categoryIds : [item.categoryId];
  const filteredItems = filterCats.length === 0
    ? items
    : items.filter(i => getItemCategoryIds(i).some(id => filterCats.includes(id)));
  const toggleFilterCat = (id: string) => {
    setFilterCats(selected =>
      selected.includes(id) ? selected.filter(catId => catId !== id) : [...selected, id]);
  };
  const visibleItemCategories = categories.filter(c => {
    const q = itemCatSearch.trim().toLowerCase();
    return !q || c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  // ════════ ITEMS ════════
  const resetItemForm = () => {
    setEditItem(null); setItemTitle(''); setItemCats([]); setItemDesc('');
    setItemFile(null); setItemPreview(null); setItemErr(''); setItemCatSearch('');
    if (fileRef.current) fileRef.current.value = '';
  };
  const openNewItem = () => { resetItemForm(); setShowItemForm(true); };
  const openEditItem = (item: GalleryItem) => {
    setEditItem(item); setItemTitle(item.title); setItemCats(getItemCategoryIds(item));
    setItemDesc(item.description); setItemFile(null);
    setItemPreview(item.imageUrl ? `${apiBase}${item.imageUrl}` : null);
    setItemErr(''); setItemCatSearch(''); setShowItemForm(true);
  };
  const handleItemFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setItemFile(file);
    if (file) setItemPreview(URL.createObjectURL(file));
  };
  const handleItemSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (itemCats.length === 0) {
      setItemErr('حداقل یک دسته‌بندی انتخاب کنید');
      return;
    }
    setItemErr(''); setItemLoading(true);
    const fd = new FormData();
    fd.append('title', itemTitle);
    fd.append('categoryId', itemCats[0] || '');
    fd.append('categoryIds', JSON.stringify(itemCats));
    fd.append('description', itemDesc);
    if (itemFile) fd.append('image', itemFile);
    const url = editItem ? `${API}/api/admin/items/${editItem.id}` : `${API}/api/admin/items`;
    const method = editItem ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (handleAuthError(res.status)) return;
      const data = await res.json();
      if (!res.ok) { setItemErr(data.error || 'خطا'); setItemLoading(false); return; }
      refresh(); setShowItemForm(false); resetItemForm();
    } catch { setItemErr('خطای شبکه'); }
    setItemLoading(false);
  };
  const toggleItemCat = (id: string) => {
    setItemCats(selected =>
      selected.includes(id) ? selected.filter(catId => catId !== id) : [...selected, id]);
  };
  const handleDeleteItem = async (id: string) => {
    const res = await fetch(`${API}/api/admin/items/${id}`, { method: 'DELETE', headers: authHeaders });
    if (handleAuthError(res.status)) { setDeleteConfirm(null); return; }
    if (res.ok) { refresh(); setDeleteConfirm(null); }
    else { alert('حذف انجام نشد. دوباره تلاش کنید.'); }
  };

  // ════════ SLIDES ════════
  const resetSlideForm = () => {
    setEditSlide(null); setSlideTag(''); setSlideTitle(''); setSlideSubtitle('');
    setSlideFile(null); setSlidePreview(null); setSlideErr('');
    if (slideFileRef.current) slideFileRef.current.value = '';
  };
  const openNewSlide = () => { resetSlideForm(); setShowSlideForm(true); };
  const openEditSlide = (s: Slide) => {
    setEditSlide(s); setSlideTag(s.tag || ''); setSlideTitle(s.title || '');
    setSlideSubtitle(s.subtitle || ''); setSlideFile(null);
    setSlidePreview(s.imageUrl ? `${apiBase}${s.imageUrl}` : null);
    setSlideErr(''); setShowSlideForm(true);
  };
  const handleSlideFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSlideFile(file);
    if (file) setSlidePreview(URL.createObjectURL(file));
  };
  const handleSlideSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSlideErr(''); setSlideLoading(true);
    const fd = new FormData();
    fd.append('tag', slideTag);
    fd.append('title', slideTitle);
    fd.append('subtitle', slideSubtitle);
    if (slideFile) fd.append('image', slideFile);
    const url = editSlide ? `${API}/api/admin/slides/${editSlide.id}` : `${API}/api/admin/slides`;
    const method = editSlide ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      if (handleAuthError(res.status)) return;
      const data = await res.json();
      if (!res.ok) { setSlideErr(data.error || 'خطا'); setSlideLoading(false); return; }
      refresh(); setShowSlideForm(false); resetSlideForm();
    } catch { setSlideErr('خطای شبکه'); }
    setSlideLoading(false);
  };
  const handleDeleteSlide = async (id: string) => {
    const res = await fetch(`${API}/api/admin/slides/${id}`, { method: 'DELETE', headers: authHeaders });
    if (handleAuthError(res.status)) { setDeleteConfirm(null); return; }
    if (res.ok) { refresh(); setDeleteConfirm(null); }
    else { alert('حذف انجام نشد. دوباره تلاش کنید.'); }
  };
  const moveSlide = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const a = slides[index], b = slides[target];
    const put = (s: Slide, order: number) => {
      const fd = new FormData(); fd.append('order', String(order));
      return fetch(`${API}/api/admin/slides/${s.id}`, { method: 'PUT', headers: authHeaders, body: fd });
    };
    await Promise.all([put(a, b.order), put(b, a.order)]);
    refresh();
  };

  // ════════ CATEGORIES ════════
  const handleCatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCatErr(''); setCatLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/categories`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: catId.trim().toLowerCase().replace(/\s+/g, '_'), label: catLabel })
      });
      if (handleAuthError(res.status)) return;
      const data = await res.json();
      if (!res.ok) { setCatErr(data.error || 'خطا'); setCatLoading(false); return; }
      refresh(); setShowCatForm(false); setCatId(''); setCatLabel('');
    } catch { setCatErr('خطای شبکه'); }
    setCatLoading(false);
  };
  const handleDeleteCat = async (id: string) => {
    const res = await fetch(`${API}/api/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders });
    if (handleAuthError(res.status)) { setDeleteConfirm(null); return; }
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    refresh(); setDeleteConfirm(null);
  };

  // ════════ LOGO ════════
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoBusy(true);
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const res = await fetch(`${API}/api/admin/logo`, { method: 'POST', headers: authHeaders, body: fd });
      if (res.ok) refresh();
    } catch { /* ignore */ }
    setLogoBusy(false);
    if (logoFileRef.current) logoFileRef.current.value = '';
  };
  const handleLogoRemove = async () => {
    setLogoBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/logo`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) refresh();
    } catch { /* ignore */ }
    setLogoBusy(false);
  };

  const handleProcessImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessImageBusy(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API}/api/admin/content/process-image`, { method: 'POST', headers: authHeaders, body: fd });
      if (res.ok) {
        const next = await res.json();
        setForm(f => f
          ? { ...f, process: { ...f.process, imageUrl: next.process.imageUrl } }
          : structuredClone(next));
        refresh();
      }
    } catch { /* ignore */ }
    setProcessImageBusy(false);
    if (processImageRef.current) processImageRef.current.value = '';
  };
  const handleProcessImageRemove = async () => {
    setProcessImageBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/content/process-image`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        const next = await res.json();
        setForm(f => f
          ? { ...f, process: { ...f.process, imageUrl: next.process.imageUrl } }
          : structuredClone(next));
        refresh();
      }
    } catch { /* ignore */ }
    setProcessImageBusy(false);
  };

  // ════════ CONTENT ════════
  const saveContent = async () => {
    if (!form) return;
    setContentSaving(true); setContentMsg('');
    try {
      const res = await fetch(`${API}/api/admin/content`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (handleAuthError(res.status)) return;
      if (!res.ok) { setContentMsg('خطا در ذخیره'); }
      else { refresh(); setContentMsg('✓ ذخیره شد'); }
    } catch { setContentMsg('خطای شبکه'); }
    setContentSaving(false);
    setTimeout(() => setContentMsg(''), 2500);
  };
  // Helpers to update nested form fields immutably.
  const setF = (section: keyof SiteContent, key: string, value: string | boolean) =>
    setForm(f => f ? { ...f, [section]: { ...(f[section] as any), [key]: value } } : f);
  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">نور<span> ادمین</span></div>
        <nav className="sidebar-nav">
          <button className={tab === 'slides' ? 'active' : ''} onClick={() => setTab('slides')}>
            <span>🎞</span> اسلایدر
          </button>
          <button className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>
            <span>🖼</span> آیتم‌های گالری
          </button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>
            <span>🏷</span> دسته‌بندی‌ها
          </button>
          <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
            <span>📝</span> محتوای صفحه
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">👤 {username}</div>
          <button className="logout-btn" onClick={logout}>خروج</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* ════ SLIDES TAB ════ */}
        {tab === 'slides' && (
          <div>
            <div className="admin-topbar">
              <h1>اسلایدر صفحه اصلی</h1>
              <button className="btn-add" onClick={openNewSlide}>+ افزودن اسلاید</button>
            </div>
            {loading ? (
              <div className="admin-loading">در حال بارگذاری...</div>
            ) : slides.length === 0 ? (
              <div className="admin-empty">
                <span>🎞</span><p>هیچ اسلایدی وجود ندارد</p>
                <button className="btn-add" onClick={openNewSlide}>+ افزودن اولین اسلاید</button>
              </div>
            ) : (
              <div className="slides-grid">
                {slides.map((s, i) => (
                  <div key={s.id} className="slide-row">
                    <div
                      className="slide-thumb"
                      style={s.imageUrl
                        ? { backgroundImage: `url(${apiBase}${s.imageUrl})` }
                        : { background: 'linear-gradient(135deg,#3a2520,#c97b6b)' }}
                    >
                      {!s.imageUrl && <span>🖼</span>}
                    </div>
                    <div className="slide-row-info">
                      {s.tag && <span className="item-cat-badge">{s.tag}</span>}
                      <div className="item-title">{s.title || <em style={{ color: '#b89' }}>بدون عنوان</em>}</div>
                      {s.subtitle && <p className="item-desc">{s.subtitle}</p>}
                    </div>
                    <div className="slide-order">
                      <button onClick={() => moveSlide(i, -1)} disabled={i === 0} title="بالا">▲</button>
                      <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} title="پایین">▼</button>
                    </div>
                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => openEditSlide(s)}>ویرایش</button>
                      <button className="btn-del" onClick={() => setDeleteConfirm(`slide:${s.id}`)}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ ITEMS TAB ════ */}
        {tab === 'items' && (
          <div>
            <div className="admin-topbar">
              <h1>آیتم‌های گالری</h1>
              <button className="btn-add" onClick={openNewItem}>+ افزودن آیتم</button>
            </div>
            <div className="admin-filter-bar">
              <button className={`acat-btn${filterCats.length === 0 ? ' on' : ''}`} onClick={() => setFilterCats([])}>
                همه ({items.length})
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`acat-btn${filterCats.includes(c.id) ? ' on' : ''}`}
                  onClick={() => toggleFilterCat(c.id)}
                  aria-pressed={filterCats.includes(c.id)}
                >
                  {c.label} ({items.filter(i => getItemCategoryIds(i).includes(c.id)).length})
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
                        {getItemCategoryIds(item)
                          .map(id => categories.find(c => c.id === id)?.label || id)
                          .join('، ')}
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
              {categories.map(c => {
                const count = items.filter(i => getItemCategoryIds(i).includes(c.id)).length;
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

        {/* ════ CONTENT TAB ════ */}
        {tab === 'content' && form && (
          <div>
            <div className="admin-topbar">
              <h1>محتوای صفحه</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {contentMsg && <span className="content-msg">{contentMsg}</span>}
                <button className="btn-add" onClick={saveContent} disabled={contentSaving}>
                  {contentSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>

            {/* Logo */}
            <div className="content-card">
              <h3>لوگو سایت</h3>
              <div className="logo-manage">
                <div className="logo-preview">
                  {logoUrl
                    ? <img src={`${apiBase}${logoUrl}`} alt="لوگو فعلی" />
                    : <span className="logo-text-fallback">نور<i> استودیو</i></span>}
                </div>
                <div className="logo-actions">
                  <button type="button" className="btn-save" disabled={logoBusy} onClick={() => logoFileRef.current?.click()}>
                    {logoBusy ? 'در حال آپلود...' : logoUrl ? 'تغییر لوگو' : 'آپلود لوگو'}
                  </button>
                  {logoUrl && (
                    <button type="button" className="btn-cancel" disabled={logoBusy} onClick={handleLogoRemove}>
                      حذف لوگو
                    </button>
                  )}
                  <input ref={logoFileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <small className="content-hint">اگر لوگو نگذارید، نام متنی «نور استودیو» نمایش داده می‌شود. JPG/PNG/WEBP — حداکثر ۱۰MB.</small>
                </div>
              </div>
            </div>

            {/* Hero buttons + badge */}
            <div className="content-card">
              <h3>هیرو / اسلایدر</h3>
              <div className="content-grid">
                <label>بَج (متن چیپ بالای اسلاید)
                  <input value={form.hero.badge} onChange={e => setF('hero', 'badge', e.target.value)} />
                </label>
                <label>متن دکمه اول
                  <input value={form.hero.btnPrimaryText} onChange={e => setF('hero', 'btnPrimaryText', e.target.value)} />
                </label>
                <label>لینک دکمه اول
                  <input dir="ltr" value={form.hero.btnPrimaryLink} onChange={e => setF('hero', 'btnPrimaryLink', e.target.value)} />
                </label>
                <label>متن دکمه دوم
                  <input value={form.hero.btnSecondaryText} onChange={e => setF('hero', 'btnSecondaryText', e.target.value)} />
                </label>
                <label>لینک دکمه دوم
                  <input dir="ltr" value={form.hero.btnSecondaryLink} onChange={e => setF('hero', 'btnSecondaryLink', e.target.value)} />
                </label>
              </div>
              <small className="content-hint">عنوان و زیرعنوان هر اسلاید را از تب «اسلایدر» ویرایش کنید.</small>
            </div>

            {/* Process */}
            <div className="content-card">
              <h3>بخش فرآیند کار</h3>
              <div className="process-admin-media">
                <div className="process-admin-preview">
                  {form.process.imageUrl
                    ? <img src={`${apiBase}${form.process.imageUrl}`} alt="تصویر فعلی بخش فرآیند" />
                    : <span>تصویر بخش فرآیند</span>}
                </div>
                <div className="logo-actions">
                  <button type="button" className="btn-save" disabled={processImageBusy} onClick={() => processImageRef.current?.click()}>
                    {processImageBusy ? 'در حال آپلود...' : form.process.imageUrl ? 'تغییر تصویر' : 'آپلود تصویر'}
                  </button>
                  {form.process.imageUrl && (
                    <button type="button" className="btn-cancel" disabled={processImageBusy} onClick={handleProcessImageRemove}>
                      حذف تصویر
                    </button>
                  )}
                  <input ref={processImageRef} type="file" accept="image/*" onChange={handleProcessImageUpload} style={{ display: 'none' }} />
                  <small className="content-hint">این تصویر در سمت چپ بخش فرآیند نمایش داده می‌شود. JPG/PNG/WEBP — حداکثر ۱۰MB.</small>
                </div>
              </div>
              <div className="content-grid">
                <label>عنوان کوچک
                  <input value={form.process.eyebrow} onChange={e => setF('process', 'eyebrow', e.target.value)} />
                </label>
                <label>عنوان اصلی
                  <input value={form.process.title} onChange={e => setF('process', 'title', e.target.value)} />
                </label>
                <label>متن دکمه
                  <input value={form.process.btnText} onChange={e => setF('process', 'btnText', e.target.value)} />
                </label>
                <label>لینک دکمه
                  <input dir="ltr" value={form.process.btnLink} onChange={e => setF('process', 'btnLink', e.target.value)} />
                </label>
                <label className="content-wide">متن بخش
                  <textarea value={form.process.text} onChange={e => setF('process', 'text', e.target.value)} rows={6} />
                </label>
              </div>
            </div>

            {/* CTA */}
            <div className="content-card">
              <h3>بخش تماس و رزرو (CTA)</h3>
              <div className="content-grid">
                <label>عنوان
                  <input value={form.cta.title} onChange={e => setF('cta', 'title', e.target.value)} />
                </label>
                <label>متن
                  <input value={form.cta.text} onChange={e => setF('cta', 'text', e.target.value)} />
                </label>
                <label>شماره تماس اول
                  <input dir="ltr" value={form.cta.phoneOne} onChange={e => setF('cta', 'phoneOne', e.target.value)} />
                </label>
                <label>شماره تماس دوم
                  <input dir="ltr" value={form.cta.phoneTwo} onChange={e => setF('cta', 'phoneTwo', e.target.value)} />
                </label>
                <label>لینک واتساپ
                  <input dir="ltr" value={form.cta.whatsappLink} onChange={e => setF('cta', 'whatsappLink', e.target.value)} />
                </label>
                <label>لینک اینستاگرام
                  <input dir="ltr" value={form.cta.instagramLink} onChange={e => setF('cta', 'instagramLink', e.target.value)} />
                </label>
                <label className="content-wide">آدرس
                  <input value={form.cta.address} onChange={e => setF('cta', 'address', e.target.value)} />
                </label>
              </div>
            </div>

            {/* Quick contact */}
            <div className="content-card">
              <h3>تماس سریع پایین صفحه</h3>
              <label className="content-check">
                <input
                  type="checkbox"
                  checked={form.quickContact.enabled}
                  onChange={e => setF('quickContact', 'enabled', e.target.checked)}
                />
                نمایش آیکن‌های تماس، واتساپ و اینستاگرام پایین صفحه
              </label>
              <div className="content-grid">
                <label>متن نوار
                  <input value={form.quickContact.text} onChange={e => setF('quickContact', 'text', e.target.value)} />
                </label>
                <label>لینک تماس
                  <input dir="ltr" value={form.quickContact.phoneLink} onChange={e => setF('quickContact', 'phoneLink', e.target.value)} />
                </label>
                <label>لینک واتساپ
                  <input dir="ltr" value={form.quickContact.whatsappLink} onChange={e => setF('quickContact', 'whatsappLink', e.target.value)} />
                </label>
                <label>لینک اینستاگرام
                  <input dir="ltr" value={form.quickContact.instagramLink} onChange={e => setF('quickContact', 'instagramLink', e.target.value)} />
                </label>
              </div>
              <small className="content-hint">برای تماس از tel: و برای واتساپ از https://wa.me/ استفاده کنید. لینک اینستاگرام با https://instagram.com/ شروع می‌شود.</small>
            </div>

            {/* Footer */}
            <div className="content-card">
              <h3>فوتر</h3>
              <div className="content-grid">
                <label>نام برند
                  <input value={form.footer.brand} onChange={e => setF('footer', 'brand', e.target.value)} />
                </label>
                <label>متن کپی‌رایت
                  <input value={form.footer.copyright} onChange={e => setF('footer', 'copyright', e.target.value)} />
                </label>
                <label>لینک اینستاگرام
                  <input dir="ltr" value={form.footer.instagram} onChange={e => setF('footer', 'instagram', e.target.value)} />
                </label>
                <label>لینک تلگرام
                  <input dir="ltr" value={form.footer.telegram} onChange={e => setF('footer', 'telegram', e.target.value)} />
                </label>
                <label>لینک واتساپ
                  <input dir="ltr" value={form.footer.whatsapp} onChange={e => setF('footer', 'whatsapp', e.target.value)} />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ════ SLIDE FORM MODAL ════ */}
      {showSlideForm && (
        <div className="modal-backdrop" onClick={() => { setShowSlideForm(false); resetSlideForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editSlide ? 'ویرایش اسلاید' : 'افزودن اسلاید جدید'}</h2>
              <button onClick={() => { setShowSlideForm(false); resetSlideForm(); }}>✕</button>
            </div>
            <form onSubmit={handleSlideSubmit} className="modal-form">
              <div
                className="upload-zone"
                onClick={() => slideFileRef.current?.click()}
                style={slidePreview ? { backgroundImage: `url(${slidePreview})` } : {}}
              >
                {!slidePreview && (
                  <>
                    <span className="upload-icon">🖼</span>
                    <p>کلیک کنید و تصویر اسلاید را انتخاب کنید</p>
                    <small>JPG، PNG، WEBP — حداکثر ۱۰MB</small>
                  </>
                )}
                {slidePreview && <div className="upload-overlay">تغییر تصویر</div>}
                <input ref={slideFileRef} type="file" accept="image/*" onChange={handleSlideFile} style={{ display: 'none' }} />
              </div>

              <label>بَج / تگ (اختیاری)</label>
              <input value={slideTag} onChange={e => setSlideTag(e.target.value)} placeholder="مثلاً: عکاسی عروسی" />

              <label>عنوان</label>
              <input value={slideTitle} onChange={e => setSlideTitle(e.target.value)} placeholder="عنوان روی اسلاید" />

              <label>زیرعنوان</label>
              <textarea value={slideSubtitle} onChange={e => setSlideSubtitle(e.target.value)} placeholder="توضیح کوتاه زیر عنوان" rows={3} />

              {slideErr && <div className="err-msg">{slideErr}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowSlideForm(false); resetSlideForm(); }}>انصراف</button>
                <button type="submit" className="btn-save" disabled={slideLoading}>
                  {slideLoading ? 'در حال ذخیره...' : editSlide ? 'ذخیره تغییرات' : 'افزودن اسلاید'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                className="upload-zone upload-zone-gallery"
                onClick={() => fileRef.current?.click()}
                style={itemPreview ? { backgroundImage: `url(${itemPreview})` } : {}}
              >
                {!itemPreview && (
                  <>
                    <span className="upload-icon">📸</span>
                    <p>تصویر گالری را با هر نسبت دلخواه انتخاب کنید</p>
                    <small>JPG، PNG، WEBP — حداکثر ۱۰MB. تصویر در سایت با نسبت اصلی خودش نمایش داده می‌شود.</small>
                  </>
                )}
                {itemPreview && <div className="upload-overlay">تغییر تصویر</div>}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleItemFile} style={{ display: 'none' }} />
              </div>

              <label>عنوان <span className="req">*</span></label>
              <input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="عنوان آیتم" required />

              <label>دسته‌بندی‌ها <span className="req">*</span></label>
              <div className="multi-cat-box" role="group" aria-label="انتخاب دسته‌بندی‌های آیتم">
                <input
                  className="multi-cat-search"
                  value={itemCatSearch}
                  onChange={e => setItemCatSearch(e.target.value)}
                  placeholder="جستجوی دسته‌بندی..."
                />
                {visibleItemCategories.map(c => (
                  <label key={c.id} className="multi-cat-option">
                    <input
                      type="checkbox"
                      checked={itemCats.includes(c.id)}
                      onChange={() => toggleItemCat(c.id)}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
                {visibleItemCategories.length === 0 && (
                  <div className="multi-cat-empty">دسته‌بندی پیدا نشد</div>
                )}
              </div>

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
                else if (type === 'slide') handleDeleteSlide(id);
                else handleDeleteCat(id);
              }}>بله، حذف کن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
