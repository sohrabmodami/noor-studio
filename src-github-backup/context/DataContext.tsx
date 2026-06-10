import { createContext, useContext, useState, ReactNode } from 'react';
import type { CardData } from '../data/cards';
import type { Slide } from '../data/slides';
import { cards as defaultCards, categories as defaultCategories } from '../data/cards';
import { slides as defaultSlides } from '../data/slides';

export interface NavItem { href: string; label: string; }
export interface CategoryItem { filter: string; label: string; count: string; }
export interface StatItem { num: string; label: string; }
export interface ProcessStep { num: string; label: string; title: string; desc: string; }

export interface AppData {
  header: {
    navItems: NavItem[];
    ctaLabel: string;
  };
  slides: Slide[];
  cards: CardData[];
  categories: CategoryItem[];
  gallery: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    titleAfter: string;
  };
  stats: {
    eyebrow: string;
    lead: string;
    items: StatItem[];
  };
  processSection: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    titleAfter: string;
    subtitle: string;
  };
  process: ProcessStep[];
  contact: {
    email: string;
    ctaHeading: string;
    ctaBody: string;
    ctaBtnPrimary: string;
    ctaBtnSecondary: string;
  };
  site: {
    footerLeft: string;
    footerCenter: string;
    footerSocial: string;
    footerSocialHref: string;
  };
}

const DEFAULT_DATA: AppData = {
  header: {
    navItems: [
      { href: '#hero', label: 'خانه' },
      { href: '#work', label: 'آثار' },
      { href: '#about', label: 'دربارهٔ ما' },
      { href: '#process', label: 'روند کار' },
      { href: '#contact', label: 'تماس' },
    ],
    ctaLabel: 'رزرو شوت ←',
  },
  slides: defaultSlides,
  cards: defaultCards,
  categories: defaultCategories,
  gallery: {
    eyebrow: '۰۱ / آثار منتخب',
    title: 'قاب‌هایی که ',
    titleAccent: 'دوست',
    titleAfter: ' داریم.',
  },
  stats: {
    eyebrow: '۰۲ / دربارهٔ ما',
    lead: 'اتاق‌هایی آرام، نوردهی‌های طولانی، و احترامِ عمیق به سوژه.',
    items: [
      { num: '۰۷', label: 'سال فعالیت' },
      { num: '۱۴۲', label: 'قاب در آرشیو' },
      { num: '۱۹', label: 'جلد مجله' },
    ],
  },
  processSection: {
    eyebrow: '۰۳ / روند کار',
    title: 'یک ',
    titleAccent: 'استودیوی آهسته',
    titleAfter: '.',
    subtitle: 'حدود ۴ هفته برای هر پروژه',
  },
  process: [
    { num: '۰۱', label: 'گفتگو', title: 'یک ساعت، بدون دوربین', desc: 'می‌نشینیم و گوش می‌دهیم. می‌فهمیم عکس می‌خواهد چه باشد، و کجا برسد.' },
    { num: '۰۲', label: 'تست', title: 'یک حلقه فیلم', desc: 'تستِ کوتاه در استودیو یا لوکیشن. کانتکت‌شیت‌ها را با هم می‌بینیم.' },
    { num: '۰۳', label: 'قاب', title: 'روزِ شوت', desc: 'نیم‌روز، گاهی دو روز. همیشه پیش از رفتنِ نور تمام می‌شود.' },
    { num: '۰۴', label: 'چاپ', title: 'تحویلِ ویراسته', desc: 'منتخب‌ها در یک هفته. اگر پروژه کاغذ بخواهد، چاپ را با پست می‌فرستیم.' },
  ],
  contact: {
    email: 'hello@noor.studio',
    ctaHeading: 'یک نامه بفرستید،\nیک قاب می‌سازیم.',
    ctaBody: 'پاسخ‌گویی در کمتر از ۴۸ ساعت. اگر می‌خواهید کار را با هم شروع کنیم، با ایمیل یا تلگرام تماس بگیرید.',
    ctaBtnPrimary: 'hello@noor.studio',
    ctaBtnSecondary: 'رزرو شوت ←',
  },
  site: {
    footerLeft: '© استودیو نور · ۱۴۰۵',
    footerCenter: 'ساخته شده روی کاغذ، سپس روی نمایشگر',
    footerSocial: '@noor.studio',
    footerSocialHref: '#',
  },
};

const STORAGE_KEY = 'noor_admin_data';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_DATA,
        ...parsed,
        gallery: { ...DEFAULT_DATA.gallery, ...parsed.gallery },
        stats: { ...DEFAULT_DATA.stats, ...parsed.stats },
        processSection: { ...DEFAULT_DATA.processSection, ...parsed.processSection },
      };
    }
  } catch {}
  return DEFAULT_DATA;
}

function persist(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface DataContextValue {
  data: AppData;
  update: <K extends keyof AppData>(key: K, value: AppData[K]) => void;
  reset: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  const update = <K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  };

  const reset = () => {
    setData(DEFAULT_DATA);
    persist(DEFAULT_DATA);
  };

  return (
    <DataContext.Provider value={{ data, update, reset }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}

export { DEFAULT_DATA };
