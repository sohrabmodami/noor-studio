import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminLogin() {
  const { login, sessionExpired } = useAuth();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const error = await login(u, p);
    if (error) setErr(error);
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">نور<span> استودیو</span></div>
        <h2>ورود به پنل مدیریت</h2>
        {sessionExpired && !err && (
          <div className="err-msg">نشست شما منقضی شده است. لطفاً دوباره وارد شوید.</div>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <label>نام کاربری</label>
          <input value={u} onChange={e => setU(e.target.value)} placeholder="admin" required autoFocus />
          <label>رمز عبور</label>
          <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" required />
          {err && <div className="err-msg">{err}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}
