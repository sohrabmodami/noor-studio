import { createContext, useContext, useState, ReactNode } from 'react';

export interface SiteContent {
  header: {
    logo: string;
    ctaBtn: string;
    navLabels: { hero: string; gallery: string; process: string; cta: string };
  };
  hero: {
    slides: Array<{ tag: string }>;
  };
  process: {
    eyebrow: string;
    title: string;
    titleBold: string;
    steps: Array<{ n: string; title: string; desc: string }>;
  };
  cta: {
    heading: string;
    headingBold: string;
    desc: string;
    emailHref: string;
    emailLabel: string;
    instagramHref: string;
    instagramLabel: string;
  };
  footer: {
    logo: string;
    copyright: string;
    instagramHref: string;
    telegramHref: string;
    whatsappHref: string;
  };
}

export const DEFAULTS: SiteContent = {
  header: {
    logo: 'نور استودیو',
    ctaBtn: 'رزرو رایگان',
    navLabels: { hero: 'خانه', gallery: 'گالری', process: 'فرآیند', cta: 'تماس' },
  },
  hero: {
    slides: [
      { tag: 'عکاسی عروسی' },
      { tag: 'پرتره حرفه‌ای' },
      { tag: 'عکاسی خانوادگی' },
    ],
  },
  process: {
    eyebrow: 'فرآیند کار',
    title: 'چطور ',
    titleBold: 'باهم کار می‌کنیم؟',
    steps: [
      { n: '۰۱', title: 'مشاوره رایگان', desc: 'یک جلسه آنلاین یا حضوری برای آشنایی با سلیقه و نیاز شما.' },
      { n: '۰۲', title: 'برنامه‌ریزی', desc: 'انتخاب لوکیشن، تاریخ و تنظیم جزئیات پروژه با هم.' },
      { n: '۰۳', title: 'روز عکاسی', desc: 'یک تجربه راحت و صمیمی — فقط خودتان باشید!' },
      { n: '۰۴', title: 'تحویل آثار', desc: 'ویرایش حرفه‌ای و تحویل فایل‌ها در ۳ تا ۴ هفته.' },
    ],
  },
  cta: {
    heading: 'آماده‌اید لحظاتتان را',
    headingBold: 'جاودان کنید؟',
    desc: 'همین الان رزرو کنید — اولین مشاوره کاملاً رایگان است.',
    emailHref: 'mailto:info@noorstudio.ir',
    emailLabel: 'ارسال ایمیل',
    instagramHref: 'https://instagram.com',
    instagramLabel: 'اینستاگرام ما',
  },
  footer: {
    logo: 'نور استودیو',
    copyright: '© ۱۴۰۵ — تمامی حقوق محفوظ است',
    instagramHref: '#',
    telegramHref: '#',
    whatsappHref: '#',
  },
};

const LS_KEY = 'noor_site_content';

function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    return JSON.parse(raw) as SiteContent;
  } catch {
    return DEFAULTS;
  }
}

interface SiteContentCtx {
  content: SiteContent;
  update: (content: SiteContent) => void;
  reset: () => void;
}

const Ctx = createContext<SiteContentCtx>({} as SiteContentCtx);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(loadContent);

  const update = (next: SiteContent) => {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setContent(next);
  };

  const reset = () => {
    localStorage.removeItem(LS_KEY);
    setContent(DEFAULTS);
  };

  return <Ctx.Provider value={{ content, update, reset }}>{children}</Ctx.Provider>;
}

export const useSiteContent = () => useContext(Ctx);
