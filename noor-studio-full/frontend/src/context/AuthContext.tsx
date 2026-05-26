import { createContext, useContext, useState, ReactNode } from 'react';

// Local credentials — works on HTTP (no crypto.subtle needed)
const VALID = btoa('noor\x00Studio@1404');

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
    if (btoa(`${u}\x00${p}`) !== VALID) return 'نام کاربری یا رمز اشتباه است';
    const tok = btoa(`${u}:${Date.now()}`);
    localStorage.setItem('noor_token', tok);
    localStorage.setItem('noor_user', u);
    setToken(tok);
    setUsername(u);
    return null;
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
