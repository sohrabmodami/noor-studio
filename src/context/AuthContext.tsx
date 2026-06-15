import { createContext, useContext, useState, ReactNode } from 'react';

const API = import.meta.env.VITE_API_URL || '';

interface AuthCtx {
  token: string | null;
  username: string | null;
  login: (u: string, p: string) => Promise<string | null>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('noor_token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('noor_user'));

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

  return <Ctx.Provider value={{ token, username, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
