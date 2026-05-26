import { createContext, useContext, useState, ReactNode } from 'react';

export interface Category {
  id: string;
  label: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  imageUrl: string | null; // full URL or base64
  createdAt: string;
}

interface DataCtx {
  categories: Category[];
  items: GalleryItem[];
  loading: boolean;
  refresh: () => void;
  saveCategories: (cats: Category[]) => void;
  saveItems: (its: GalleryItem[]) => void;
}

const CAT_KEY  = 'noor_categories';
const ITEM_KEY = 'noor_items';

function load<T>(key: string, def: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : def;
  } catch {
    return def;
  }
}

const Ctx = createContext<DataCtx>({} as DataCtx);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCats]   = useState<Category[]>(() => load<Category[]>(CAT_KEY, []));
  const [items,      setItemsSt] = useState<GalleryItem[]>(() => load<GalleryItem[]>(ITEM_KEY, []));

  const saveCategories = (cats: Category[]) => {
    localStorage.setItem(CAT_KEY, JSON.stringify(cats));
    setCats(cats);
  };

  const saveItems = (its: GalleryItem[]) => {
    localStorage.setItem(ITEM_KEY, JSON.stringify(its));
    setItemsSt(its);
  };

  const refresh = () => {
    setCats(load<Category[]>(CAT_KEY, []));
    setItemsSt(load<GalleryItem[]>(ITEM_KEY, []));
  };

  return (
    <Ctx.Provider value={{ categories, items, loading: false, refresh, saveCategories, saveItems }}>
      {children}
    </Ctx.Provider>
  );
}

export const useData = () => useContext(Ctx);
