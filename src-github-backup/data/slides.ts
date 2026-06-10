export interface Slide {
  cat: string;
  tag: string;
  title: string;
  titleAccent: string;
  titleAfter: string;
  desc: string;
  meta: string[];
  imageUrl?: string;
}

export const slides: Slide[] = [
  {
    cat: 'editorial',
    tag: 'پروژهٔ جدید — شمارهٔ ۰۰۷',
    title: 'روایتِ ',
    titleAccent: 'چای',
    titleAfter: '،\nدر سکوتِ بعد از ظهر.',
    desc: 'یک سری پرتره و طبیعت بی‌جان برای مجلهٔ آپارت. هشت قاب، نور پنجره، و چای‌خانه‌ای در تجریش.',
    meta: ['📷 Hasselblad 500CM', 'Portra 400', 'اردیبهشت ۱۴۰۵'],
  },
  {
    cat: 'architecture',
    tag: 'سری معماری',
    title: 'طاق و ',
    titleAccent: 'گنبد',
    titleAfter: '،\nکاشانِ نوربلند.',
    desc: 'دوازده قاب از حمام‌های قدیمی و کاروانسراها در نور صبحگاهی. تیلت‌شیفت و نوردهی طولانی.',
    meta: ['📐 Tilt-shift 24mm', 'ƒ/8 · ۸ ثانیه', 'کاشان ۱۴۰۳'],
  },
  {
    cat: 'fashion',
    tag: 'کالکشن جلد دوم',
    title: 'پشمینه، ',
    titleAccent: 'در باد',
    titleAfter: '،\nیک‌پانزدهم ثانیه.',
    desc: 'همکاری با برند آرام — پشمینه‌های دست‌بافت، در یک روزِ بادی پاییز. ندان دی۴، شاتر آهسته.',
    meta: ['🎞 Medium format', '1/15s · ND4', 'استودیو ۱۴۰۴'],
  },
];
