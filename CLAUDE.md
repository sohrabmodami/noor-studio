# استودیو نور — NOOR Photo Studio

وبسایت استاتیک استودیو عکاسی نور. صفحه‌ی لندینگ فارسی (RTL) با چند بخش تعاملی.

## دستورات اصلی

```bash
npm run dev      # سرور توسعه روی پورت 5175
npm run build    # بیلد production (tsc + vite)
npm run preview  # پیش‌نمایش بیلد
```

## تکنولوژی

- **Vite 5 + React 18 + TypeScript**
- **Plain CSS** — فایل `src/index.css` (بدون Tailwind)، توکن‌های OKLCH در `:root`
- **RTL/Persian** — `lang="fa" dir="rtl"` در `index.html`، فونت Vazirmatn از Google Fonts
- لوگو: `src/assets/logo.jpg` (NOOR photo studio — طلایی روی سفید)

## ساختار فایل‌ها

```
src/
├── App.tsx                  # ترکیب همه بخش‌ها
├── index.css                # تمام استایل‌ها (توکن‌ها + کامپوننت‌ها)
├── main.tsx
├── assets/
│   └── logo.jpg             # لوگو NOOR photo studio
├── components/
│   ├── Loader.tsx           # انیمیشن aperture — محو می‌شه بعد از 1.6 ثانیه
│   ├── Header.tsx           # pill شناور فیکس در بالای صفحه
│   ├── HeroSlider.tsx       # اسلایدر cross-fade، ارتفاع 500px
│   ├── CategoryBar.tsx      # نوار فیلتر دسته‌بندی
│   ├── SectionHeading.tsx   # کامپوننت reusable عنوان بخش
│   ├── CardGrid.tsx         # گرید 12 ستونه، مدیریت activeFilter
│   ├── Card.tsx             # کارت پروژه با hover parallax و save toggle
│   ├── Stats.tsx            # نوار تیره با اعداد آماری
│   ├── Process.tsx          # ۴ مرحله روند کار
│   ├── CTA.tsx              # بخش call-to-action با orb amber
│   └── Footer.tsx           # فوتر ۳ ستونه
├── data/
│   ├── slides.ts            # ۳ اسلاید hero
│   └── cards.ts             # ۹ کارت پروژه + تعریف Category و CardSize
└── utils/
    └── persian.ts           # تابع toPersian(n, pad) برای اعداد فارسی
```

## توکن‌های CSS

همه در `:root` داخل `index.css`:

| توکن | کاربرد |
|------|---------|
| `--bg` | پس‌زمینه صفحه (کرم روشن) |
| `--surface` | سطح سفید (کارت، pill) |
| `--ink` / `--ink-2` | رنگ متن اصلی / فرعی |
| `--amber` / `--amber-deep` | رنگ برند طلایی |
| `--maxw: 1280px` | حداکثر عرض صفحه |
| `--gut` | فاصله‌گذاری (clamp 24–40px) |

## نکات مهم

- **استایل:** فقط در `src/index.css` — هر بخش یک block جداگانه با comment
- **عرض صفحه:** `.page { max-width: var(--maxw); margin: 0 auto; }` در `App.tsx`
- **Header:** `position: fixed; top: 12px; left: 50%; transform: translateX(-50%)` — pill شناور
- **اسلایدر:** cross-fade با opacity (نه translateX)، auto-advance هر 4500ms
- **کارت‌ها:** اندازه‌ها با `CardSize` کنترل می‌شن (default/sm/lg/xl/half)
- **اعداد:** از `toPersian()` برای تبدیل اعداد لاتین به فارسی استفاده کن
- **تصاویر واقعی نداریم** — placeholder با CSS gradient بر اساس `data-cat` attribute

## دسته‌بندی‌های کارت

`portrait` | `fashion` | `architecture` | `editorial` | `still` | `street` | `wedding`
