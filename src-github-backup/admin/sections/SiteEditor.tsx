import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PASS_KEY } from '../AdminLogin';

export default function SiteEditor() {
  const { data, update, reset } = useData();
  const [form, setForm] = useState(data.site);
  const [saved, setSaved] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleSave = () => {
    update('site', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (field: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleChangePass = () => {
    if (!newPass) return setPassMsg('رمز جدید نمی‌تواند خالی باشد.');
    if (newPass !== confirmPass) return setPassMsg('رمزها با هم مطابقت ندارند.');
    localStorage.setItem(PASS_KEY, newPass);
    setPassMsg('رمز عبور با موفقیت تغییر یافت.');
    setNewPass('');
    setConfirmPass('');
  };

  const handleReset = () => {
    reset();
    setShowReset(false);
    setForm(data.site);
  };

  return (
    <div className="ae-section">
      <div className="ae-section-header">
        <h2 className="ae-section-title">تنظیمات سایت</h2>
        <button className={`af-btn-primary${saved ? ' af-btn-saved' : ''}`} onClick={handleSave}>
          {saved ? 'ذخیره شد ✓' : 'ذخیره'}
        </button>
      </div>

      <div className="ae-card">
        <span className="ae-label-sm">فوتر</span>
        <div className="ae-fields-grid">
          <div className="af-group">
            <label className="af-label">متن چپ (کپی‌رایت)</label>
            <input className="af-input" value={form.footerLeft}
              onChange={e => set('footerLeft', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">متن وسط</label>
            <input className="af-input" value={form.footerCenter}
              onChange={e => set('footerCenter', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">متن شبکه اجتماعی</label>
            <input className="af-input" dir="ltr" value={form.footerSocial}
              onChange={e => set('footerSocial', e.target.value)} />
          </div>
          <div className="af-group">
            <label className="af-label">لینک شبکه اجتماعی</label>
            <input className="af-input" dir="ltr" value={form.footerSocialHref}
              onChange={e => set('footerSocialHref', e.target.value)}
              placeholder="https://instagram.com/noor.studio" />
          </div>
        </div>
      </div>

      <div className="ae-card">
        <span className="ae-label-sm">تغییر رمز عبور پنل</span>
        <div className="ae-fields-grid">
          <div className="af-group">
            <label className="af-label">رمز جدید</label>
            <input className="af-input" type="password" value={newPass}
              onChange={e => { setNewPass(e.target.value); setPassMsg(''); }} />
          </div>
          <div className="af-group">
            <label className="af-label">تکرار رمز جدید</label>
            <input className="af-input" type="password" value={confirmPass}
              onChange={e => { setConfirmPass(e.target.value); setPassMsg(''); }} />
          </div>
        </div>
        {passMsg && <p className="ae-pass-msg">{passMsg}</p>}
        <button className="af-btn-ghost" onClick={handleChangePass}>تغییر رمز</button>
      </div>

      <div className="ae-card ae-card-danger">
        <span className="ae-label-sm">منطقهٔ خطر</span>
        <p className="ae-hint">بازنشانی تمام تغییرات و بازگشت به داده‌های پیش‌فرض. این عمل قابل بازگشت نیست.</p>
        {!showReset
          ? <button className="af-btn-danger" onClick={() => setShowReset(true)}>بازنشانی به پیش‌فرض</button>
          : (
            <div className="ae-confirm-row">
              <span>مطمئن هستید؟</span>
              <button className="af-btn-danger" onClick={handleReset}>بله، بازنشانی شود</button>
              <button className="af-btn-ghost" onClick={() => setShowReset(false)}>انصراف</button>
            </div>
          )
        }
      </div>
    </div>
  );
}
