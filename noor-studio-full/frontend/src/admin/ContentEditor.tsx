import { useState, useEffect, useRef } from 'react';
import { useSiteContent, SiteContent, DEFAULTS } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

type Section = 'header' | 'hero' | 'process' | 'cta' | 'footer';

const SECTION_LABELS: Record<Section, string> = {
  header: 'هدر',
  hero: 'هیرو',
  process: 'فرآیند',
  cta: 'CTA',
  footer: 'فوتر',
};

export default function ContentEditor() {
  const { content, update, reset } = useSiteContent();
  const { token } = useAuth();
  const [local, setLocal] = useState<SiteContent>(content);
  const [section, setSection] = useState<Section>('header');
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/api/logo`).then(r => r.json()).then(d => setLogoUrl(d.logoUrl || null)).catch(() => {});
  }, []);

  const uploadLogo = async (file: File) => {
    setLogoSaving(true);
    const fd = new FormData();
    fd.append('logo', file);
    const res = await fetch(`${API}/api/admin/logo`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    });
    const data = await res.json();
    if (data.logoUrl) setLogoUrl(data.logoUrl);
    setLogoSaving(false);
  };

  const removeLogo = async () => {
    if (!confirm('لوگو حذف شود؟')) return;
    setLogoSaving(true);
    await fetch(`${API}/api/admin/logo`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLogoUrl(null);
    setLogoSaving(false);
  };

  const save = () => {
    update(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (!confirm('آیا مطمئنید؟ تمام تغییرات به حالت اولیه بازمی‌گردند.')) return;
    reset();
    setLocal(DEFAULTS);
  };

  function set<K extends keyof SiteContent>(sec: K, patch: Partial<SiteContent[K]>) {
    setLocal(prev => ({ ...prev, [sec]: { ...(prev[sec] as object), ...patch } }));
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1>ویرایش محتوای سایت</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-cancel" onClick={handleReset}>بازنشانی</button>
          <button className="btn-save" onClick={save}>{saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}</button>
        </div>
      </div>

      <div className="content-section-tabs">
        {(Object.keys(SECTION_LABELS) as Section[]).map(s => (
          <button key={s} className={`csec-tab${section === s ? ' active' : ''}`} onClick={() => setSection(s)}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="content-editor-body">

        {section === 'header' && (
          <div className="ce-section">

            {/* Logo upload */}
            <div className="ce-group-title">لوگو سایت</div>
            <div className="logo-upload-area">
              {logoUrl
                ? <img src={`${API}${logoUrl}`} alt="logo" className="logo-preview" />
                : <div className="logo-placeholder">لوگو آپلود نشده — متن استفاده می‌شود</div>
              }
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn-edit" style={{ flex: 'none', padding: '.5rem 1.2rem' }}
                  onClick={() => logoRef.current?.click()} disabled={logoSaving}>
                  {logoSaving ? 'در حال آپلود...' : logoUrl ? 'تغییر لوگو' : 'آپلود لوگو'}
                </button>
                {logoUrl && <button className="btn-del" style={{ flex: 'none', padding: '.5rem 1rem' }}
                  onClick={removeLogo} disabled={logoSaving}>حذف</button>}
              </div>
              <small style={{ color: '#9e7e76', fontSize: '.75rem' }}>فرمت‌های مجاز: PNG، SVG — پیشنهاد: ارتفاع ۶۰px، پس‌زمینه شفاف</small>
              <input ref={logoRef} type="file" accept="image/png,image/svg+xml,image/webp" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ''; }} />
            </div>

            <div className="ce-group-title">متن جایگزین (اگر لوگو آپلود نشود)</div>
            <div className="ce-field">
              <label>متن لوگو</label>
              <input value={local.header.logo} onChange={e => set('header', { logo: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>متن دکمه رزرو</label>
              <input value={local.header.ctaBtn} onChange={e => set('header', { ctaBtn: e.target.value })} />
            </div>
            <div className="ce-group-title">لینک‌های ناوبری</div>
            {(['hero', 'gallery', 'process', 'cta'] as const).map(k => (
              <div className="ce-field" key={k}>
                <label>{k}</label>
                <input
                  value={local.header.navLabels[k]}
                  onChange={e => set('header', { navLabels: { ...local.header.navLabels, [k]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        )}

        {section === 'hero' && (
          <div className="ce-section">
            <div className="ce-group-title">برچسب اسلایدها</div>
            {local.hero.slides.map((sl, i) => (
              <div className="ce-field" key={i}>
                <label>اسلاید {i + 1}</label>
                <input
                  value={sl.tag}
                  onChange={e => {
                    const slides = [...local.hero.slides];
                    slides[i] = { ...slides[i], tag: e.target.value };
                    set('hero', { slides });
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {section === 'process' && (
          <div className="ce-section">
            <div className="ce-field">
              <label>عنوان کوچک (eyebrow)</label>
              <input value={local.process.eyebrow} onChange={e => set('process', { eyebrow: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>تیتر — بخش معمولی</label>
              <input value={local.process.title} onChange={e => set('process', { title: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>تیتر — بخش پررنگ</label>
              <input value={local.process.titleBold} onChange={e => set('process', { titleBold: e.target.value })} />
            </div>
            <div className="ce-group-title">مراحل</div>
            {local.process.steps.map((st, i) => (
              <div className="ce-step-group" key={i}>
                <div className="ce-step-head">مرحله {st.n}</div>
                <div className="ce-field">
                  <label>عنوان</label>
                  <input
                    value={st.title}
                    onChange={e => {
                      const steps = [...local.process.steps];
                      steps[i] = { ...steps[i], title: e.target.value };
                      set('process', { steps });
                    }}
                  />
                </div>
                <div className="ce-field">
                  <label>توضیحات</label>
                  <textarea
                    value={st.desc}
                    rows={2}
                    onChange={e => {
                      const steps = [...local.process.steps];
                      steps[i] = { ...steps[i], desc: e.target.value };
                      set('process', { steps });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'cta' && (
          <div className="ce-section">
            <div className="ce-field">
              <label>تیتر — بخش معمولی</label>
              <input value={local.cta.heading} onChange={e => set('cta', { heading: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>تیتر — بخش پررنگ</label>
              <input value={local.cta.headingBold} onChange={e => set('cta', { headingBold: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>متن توضیح</label>
              <textarea value={local.cta.desc} rows={2} onChange={e => set('cta', { desc: e.target.value })} />
            </div>
            <div className="ce-group-title">دکمه ایمیل</div>
            <div className="ce-field">
              <label>آدرس (mailto:...)</label>
              <input value={local.cta.emailHref} dir="ltr" onChange={e => set('cta', { emailHref: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>متن دکمه</label>
              <input value={local.cta.emailLabel} onChange={e => set('cta', { emailLabel: e.target.value })} />
            </div>
            <div className="ce-group-title">دکمه اینستاگرام</div>
            <div className="ce-field">
              <label>لینک</label>
              <input value={local.cta.instagramHref} dir="ltr" onChange={e => set('cta', { instagramHref: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>متن دکمه</label>
              <input value={local.cta.instagramLabel} onChange={e => set('cta', { instagramLabel: e.target.value })} />
            </div>
          </div>
        )}

        {section === 'footer' && (
          <div className="ce-section">
            <div className="ce-field">
              <label>لوگو</label>
              <input value={local.footer.logo} onChange={e => set('footer', { logo: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>کپی‌رایت</label>
              <input value={local.footer.copyright} onChange={e => set('footer', { copyright: e.target.value })} />
            </div>
            <div className="ce-group-title">شبکه‌های اجتماعی</div>
            <div className="ce-field">
              <label>لینک اینستاگرام</label>
              <input value={local.footer.instagramHref} dir="ltr" onChange={e => set('footer', { instagramHref: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>لینک تلگرام</label>
              <input value={local.footer.telegramHref} dir="ltr" onChange={e => set('footer', { telegramHref: e.target.value })} />
            </div>
            <div className="ce-field">
              <label>لینک واتساپ</label>
              <input value={local.footer.whatsappHref} dir="ltr" onChange={e => set('footer', { whatsappHref: e.target.value })} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
