export type CardSize = 'default' | 'sm' | 'lg' | 'xl' | 'half';
export type Category = 'portrait' | 'fashion' | 'architecture' | 'editorial' | 'still' | 'street' | 'wedding';

export interface CardData {
  id: number;
  cat: Category;
  size: CardSize;
  title: string;
  desc: string;
  tagLabel: string;
  imageUrl?: string;
  quick?: string[];
  meta?: string[];
  avatars?: boolean;
}

export const cards: CardData[] = [
  {
    id: 1,
    cat: 'editorial',
    size: 'xl',
    title: 'سری چای — مجلهٔ آپارت، شمارهٔ ۰۰۷',
    desc: 'یک سری پرتره و طبیعت بی‌جان برای آپارت. هشت قاب در نور پنجره، روی فیلم متوسط‌فرمت، در چای‌خانه‌ای کوچک در تجریش.',
    tagLabel: 'تحریریه',
    quick: ['دیدن پروژه ←', '۸ قاب'],
    meta: ['اردیبهشت ۱۴۰۵', 'تجریش'],
  },
  {
    id: 2,
    cat: 'portrait',
    size: 'sm',
    title: 'میرا، در عصرِ دیر',
    desc: 'پرتره روی پُرترا ۴۰۰، با ۳۵ میلی‌متر — نور آخر ظهرِ تهران.',
    tagLabel: 'پرتره',
    avatars: true,
  },
  {
    id: 3,
    cat: 'fashion',
    size: 'half',
    title: 'پشمینه، جلد دوم — برند آرام',
    desc: 'یک روز بادی، شاتر ۱/۱۵، ندان دی۴. پشمینه‌های دست‌بافت در حرکت.',
    tagLabel: 'مد و فشن',
    quick: ['دیدن کالکشن ←'],
    meta: ['بهمن ۱۴۰۴', '۱۲ قاب'],
  },
  {
    id: 4,
    cat: 'architecture',
    size: 'half',
    title: 'طاق و گنبد — کاشانِ نوربلند',
    desc: 'دوازده قاب از حمام‌های قدیمی در نور صبحگاهی، با تیلت‌شیفت و نوردهی طولانی.',
    tagLabel: 'معماری',
    quick: ['دیدن پروژه ←'],
    meta: ['کاشان', '۱۲ قاب'],
  },
  {
    id: 5,
    cat: 'still',
    size: 'default',
    title: 'انارِ دو نیم',
    desc: 'ماکروی ۸۵ میلی‌متر، نور پنجره، روی کاغذِ کتان.',
    tagLabel: 'طبیعت بی‌جان',
    meta: ['آذر ۱۴۰۴', '۴ قاب'],
  },
  {
    id: 6,
    cat: 'street',
    size: 'default',
    title: 'بازار، ۶:۴۲ عصر',
    desc: 'لایکا M6 و ترای‌اکس. سری کوچک، اصفهان، تابستان.',
    tagLabel: 'خیابانی',
    meta: ['اصفهان', '۹ قاب'],
  },
  {
    id: 7,
    cat: 'portrait',
    size: 'default',
    title: 'یوسف، کنارِ پنجره',
    desc: 'هاسلبلاد ۵۰۰CM. نور یک‌طرفه، پشت‌زمینهٔ تیره.',
    tagLabel: 'پرتره',
    meta: ['استودیو', '۶ قاب'],
  },
  {
    id: 8,
    cat: 'wedding',
    size: 'lg',
    title: 'نازنین و آرش — باغ ایرانی، شیراز',
    desc: 'یک روز کامل، از صبح تا شب. دو دوربین، سه فیلم، یک آلبومِ چاپ‌دستی.',
    tagLabel: 'عروسی',
    quick: ['دیدن آلبوم ←', '۸۴ قاب'],
    meta: ['شیراز', '۸۴ قاب', 'پاییز ۱۴۰۴'],
  },
  {
    id: 9,
    cat: 'fashion',
    size: 'sm',
    title: 'ابریشم در باد',
    desc: 'یک‌پانزدهم ثانیه، ندان دی۴، استودیو.',
    tagLabel: 'مد و فشن',
    meta: ['استودیو', '۵ قاب'],
  },
];

export const categories = [
  { filter: 'all',          label: 'همه',          count: '۱۴۲' },
  { filter: 'portrait',     label: 'پرتره',         count: '۳۸'  },
  { filter: 'fashion',      label: 'مد و فشن',      count: '۲۴'  },
  { filter: 'editorial',    label: 'تحریریه',       count: '۱۹'  },
  { filter: 'architecture', label: 'معماری',        count: '۲۲'  },
  { filter: 'still',        label: 'طبیعت بی‌جان',  count: '۱۷'  },
  { filter: 'street',       label: 'خیابانی',       count: '۲۲'  },
  { filter: 'wedding',      label: 'عروسی',         count: '۱۲'  },
];
