import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

export interface Slide {
  id: string;
  tag: string | null;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  order: number;
}

export interface SiteContent {
  hero: {
    badge: string;
    btnPrimaryText: string;
    btnPrimaryLink: string;
    btnSecondaryText: string;
    btnSecondaryLink: string;
  };
  process: {
    eyebrow: string;
    title: string;
    steps: { n: string; title: string; desc: string }[];
  };
  cta: {
    title: string;
    text: string;
    btnPrimaryText: string;
    btnPrimaryLink: string;
    btnSecondaryText: string;
    btnSecondaryLink: string;
  };
  footer: {
    brand: string;
    copyright: string;
    instagram: string;
    telegram: string;
    whatsapp: string;
  };
}

interface DataCtx {
  categories: Category[];
  items: GalleryItem[];
  slides: Slide[];
  content: SiteContent | null;
  logoUrl: string | null;
  loading: boolean;
  refresh: () => void;
  apiBase: string;
}

const Ctx = createContext<DataCtx>({} as DataCtx);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/categories`).then(r => r.json()),
      fetch(`${API}/api/items`).then(r => r.json()),
      fetch(`${API}/api/slides`).then(r => r.json()),
      fetch(`${API}/api/content`).then(r => r.json()),
      fetch(`${API}/api/logo`).then(r => r.json()),
    ]).then(([cats, its, sls, cnt, logo]) => {
      setCategories(cats);
      setItems(its);
      setSlides(sls);
      setContent(cnt);
      setLogoUrl(logo?.logoUrl ?? null);
    }).finally(() => setLoading(false));
  }, [tick]);

  return (
    <Ctx.Provider value={{ categories, items, slides, content, logoUrl, loading, refresh, apiBase: API }}>
      {children}
    </Ctx.Provider>
  );
}

export const useData = () => useContext(Ctx);
