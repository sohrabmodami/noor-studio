import { createContext, useContext, useState, ReactNode } from 'react';

const API = import.meta.env.VITE_API_URL || '';

interface AuthCtx {
  token: string | null;
  username: string | null;
  sessionExpired: boolean;
  login: (u: string, p: string) => Promise<string | null>;
  logout: () => void;
  handleAuthError: (status: number) => boolean;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

// JWT exp check without a library — decode payload, compare to now
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true; // unparseable token → treat as expired
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem('noor_token');
  const expiredOnLoad = !!storedToken && isTokenExpired(storedToken);
  if (expiredOnLoad) {
    localStorage.removeItem('noor_token');
    localStorage.removeItem('noor_user');
  }
  const [token, setToken] = useState<string | null>(expiredOnLoad ? null : storedToken);
  const [username, setUsername] = useState<string | null>(
    expiredOnLoad ? null : localStorage.getItem('noor_user')
  );
  const [sessionExpired, setSessionExpired] = useState<boolean>(expiredOnLoad);

  const login = async (u: string, p: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'خطا';
      localStorage.setItem('noor_token', data.token);
      localStorage.setItem('noor_user', data.username);
      setToken(data.token);
      setUsername(data.username);
      setSessionExpired(false);
      return null;
    } catch {
      return 'خطای شبکه';
    }
  };

  const logout = () => {
    localStorage.removeItem('noor_token');
    localStorage.removeItem('noor_user');
    setToken(null);
    setUsername(null);
  };

  // Call from any admin fetch. On 401, drops the dead token and flags the
  // session as expired so the login screen explains why. Returns true if it
  // handled a 401 (caller should stop and not treat the response as success).
  const handleAuthError = (status: number): boolean => {
    if (status !== 401) return false;
    localStorage.removeItem('noor_token');
    localStorage.removeItem('noor_user');
    setToken(null);
    setUsername(null);
    setSessionExpired(true);
    return true;
  };

  return (
    <Ctx.Provider value={{ token, username, sessionExpired, login, logout, handleAuthError }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
