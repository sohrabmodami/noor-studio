import { createContext, useContext, useState, ReactNode } from 'react';

// Local admin credentials (SHA-256 hash — no backend required)
const LOCAL_USER = 'noor';
const LOCAL_HASH = 'a47da6795d43eaa1c634b8af55a226b249a96ba1128e0c0b06fbef9fdcdcdc05';
const SALT = 'noor_salt_x9k';

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    const hash = await sha256(p + SALT);
    if (u !== LOCAL_USER || hash !== LOCAL_HASH) return 'نام کاربری یا رمز اشتباه است';
    const fakeToken = btoa(`${u}:${Date.now()}`);
    localStorage.setItem('noor_token', fakeToken);
    localStorage.setItem('noor_user', u);
    setToken(fakeToken);
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
