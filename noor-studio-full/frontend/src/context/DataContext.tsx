import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Empty string = same origin (Nginx proxies /api to backend)
const API = import.meta.env.VITE_API_URL || '';

export interface Category {
  id: string;
  label: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
}

interface DataCtx {
  categories: Category[];
  items: GalleryItem[];
  loading: boolean;
  refresh: () => void;
  apiBase: string;
}

const Ctx = createContext<DataCtx>({} as DataCtx);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems]           = useState<GalleryItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tick, setTick]             = useState(0);

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/categories`).then(r => r.json()),
      fetch(`${API}/api/items`).then(r => r.json()),
    ])
      .then(([cats, its]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setItems(Array.isArray(its) ? its : []);
      })
      .catch(() => { setCategories([]); setItems([]); })
      .finally(() => setLoading(false));
  }, [tick]);

  return (
    <Ctx.Provider value={{ categories, items, loading, refresh, apiBase: API }}>
      {children}
    </Ctx.Provider>
  );
}

export const useData = () => useContext(Ctx);
