import { useState } from 'react';
import logo from '../assets/logo.jpg';

const PASS_KEY = 'noor_admin_pass';

function getStoredPass() {
  return localStorage.getItem(PASS_KEY) || 'noor1404';
}

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === getStoredPass()) {
      sessionStorage.setItem('noor_admin_auth', '1');
      onLogin();
    } else {
      setError(true);
      setPass('');
    }
  };

  return (
    <div className="al-wrap">
      <div className="al-card">
        <img src={logo} alt="NOOR" className="al-logo" />
        <h1 className="al-title">پنل مدیریت</h1>
        <form onSubmit={handleSubmit} className="al-form">
          <div className="af-group">
            <label className="af-label">رمز عبور</label>
            <input
              type="password"
              className={`af-input${error ? ' af-input-err' : ''}`}
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false); }}
              placeholder="رمز عبور را وارد کنید"
              autoFocus
            />
            {error && <span className="af-err">رمز عبور اشتباه است</span>}
          </div>
          <button type="submit" className="af-btn-primary" style={{ width: '100%' }}>
            ورود
          </button>
        </form>
        <p className="al-hint">رمز پیش‌فرض: noor1404</p>
      </div>
    </div>
  );
}

export { getStoredPass, PASS_KEY };
