# راهنمای استقرار و امنیت — استودیو نور

این سند برای تحویل پروژه و راه‌اندازی روی سرور است.

## معماری

- **فرانت‌اند:** React + Vite (ریشه‌ی پروژه) — بیلد استاتیک که با nginx سرو می‌شود.
- **بک‌اند:** Express در پوشه‌ی `backend/` — API + پنل ادمین، با pm2 اجرا می‌شود.
- **دیتابیس:** SQLite (فایل `backend/noor.db`). داده‌ها سمت سرور ذخیره و به همه نمایش داده می‌شوند.
- **عکس‌ها:** در `backend/uploads/` ذخیره می‌شوند.
- فرانت با URL نسبی (`/api`, `/uploads`) به بک وصل می‌شود؛ nginx این مسیرها را به پورت ۴۰۰۰ proxy می‌کند.

## راه‌اندازی محلی (توسعه)

```bash
# ترمینال ۱ — بک‌اند
cd backend
cp .env.example .env        # برای dev کافیست
npm install
npm run dev                 # روی پورت 4000

# ترمینال ۲ — فرانت‌اند
npm install
npm run dev                 # روی پورت 5175
```

## استقرار روی سرور (VPS)

استقرار خودکار است: هر push روی شاخه‌ی `main` از طریق
`.github/workflows/deploy.yml` فرانت را بیلد و بک را با pm2 اجرا می‌کند.

**Secretهای موردنیاز در GitHub Actions:** `VPS_HOST`, `VPS_USER`,
`VPS_SSH_KEY`, `VPS_PORT`, `VPS_WEBROOT`.

### گام اجباری: ساخت فایل `.env` روی سرور (یک‌بار)

بدون این فایل، بک‌اند در حالت production **عمداً بالا نمی‌آید** (محافظت امنیتی).

```bash
cd /var/www/noor-studio/backend
node scripts/gen-secret.js "یک-رمز-قوی-برای-ادمین"
# خروجی JWT_SECRET و ADMIN_PASSWORD_HASH را داخل .env بگذارید:
nano .env
```

محتوای `.env`:

```
NODE_ENV=production
JWT_SECRET=<خروجی gen-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<خروجی gen-secret>
ALLOWED_ORIGINS=https://noorstudiogorgan.ir
```

> برای تغییر رمز ادمین بعداً: دوباره `gen-secret.js` را با رمز جدید اجرا کنید،
> مقدار `ADMIN_PASSWORD_HASH` را در `.env` عوض کنید و `pm2 restart noor-backend`.

### کانفیگ nginx (با SSL)

```nginx
# ریدایرکت HTTP به HTTPS
server {
    listen 80;
    server_name noorstudiogorgan.ir www.noorstudiogorgan.ir;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name noorstudiogorgan.ir www.noorstudiogorgan.ir;

    ssl_certificate     /etc/ssl/noorstudiogorgan.ir/fullchain.pem;
    ssl_certificate_key /etc/ssl/noorstudiogorgan.ir/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root  <VPS_WEBROOT>;          # همان مسیری که فرانت‌اند build در آن قرار می‌گیرد
    index index.html;

    client_max_body_size 11m;     # برای آپلود عکس تا ۱۰ مگابایت

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /uploads/ { proxy_pass http://127.0.0.1:4000; }
    location /         { try_files $uri $uri/ /index.html; }
}
```

> گواهی فعلی Let's Encrypt و **۹۰ روزه** است. برای تمدید خودکار، نصب `certbot` توصیه می‌شود.

## امنیت — چه چیزهایی پیاده شده

- ✅ احراز هویت JWT روی همه‌ی مسیرهای ادمین
- ✅ رمز ادمین به‌صورت bcrypt hash (نه متن ساده)؛ مقایسه‌ی timing-safe
- ✅ در production اگر `JWT_SECRET` یا رمز ضعیف باشد، سرور بالا نمی‌آید
- ✅ rate-limit: لاگین ۱۰ بار / ۱۵ دقیقه، کل API ۳۰۰ بار / ۱۵ دقیقه
- ✅ CORS محدود به دامنه‌ی production
- ✅ helmet (CSP, HSTS, X-Frame-Options, nosniff)
- ✅ آپلود فقط JPEG/PNG/WebP/GIF؛ SVG ممنوع (XSS)؛ پسوند فایل از mimetype ساخته می‌شود (نه از نام کاربر)؛ سقف ۱۰MB، تک‌فایل
- ✅ محدودیت حجم بدنه‌ی درخواست (۱۰۰KB)
- ✅ کوئری‌ها با prepared statement (بدون SQL injection)
- ✅ `npm audit`: صفر آسیب‌پذیری

## نکته‌ی باقی‌مانده (آگاهانه پذیرفته‌شده)

توکن ادمین در `localStorage` مرورگر نگه‌داری می‌شود. این برای یک پنل ادمین کوچک
رایج و قابل‌قبول است (با CSP و escape پیش‌فرض React، ریسک XSS پایین است). اگر در
آینده امنیت بالاتری لازم شد، می‌توان به کوکی `httpOnly` مهاجرت کرد.

## پشتیبان‌گیری

کل داده‌ها در دو محل است؛ همین دو را بکاپ بگیرید:

```bash
/var/www/noor-studio/backend/noor.db      # دیتابیس
/var/www/noor-studio/backend/uploads/     # عکس‌ها
```
