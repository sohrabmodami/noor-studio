# 🌸 نور استودیو — راهنمای راه‌اندازی

## ساختار پروژه
```
noor-studio-full/
├── backend/          ← Node.js API (Express)
│   ├── server.js
│   ├── data.json     ← دیتابیس JSON (خودکار ساخته می‌شود)
│   └── uploads/      ← تصاویر آپلودشده
└── frontend/         ← React + Vite + TypeScript
    └── src/
        ├── components/   ← Header, Hero, Gallery, Process, CTA, Footer
        ├── admin/        ← AdminLogin, AdminPanel
        └── context/      ← DataContext, AuthContext
```

---

## 🚀 راه‌اندازی روی VPS

### ۱. کلون پروژه
```bash
git clone https://github.com/YOUR_USERNAME/noor-studio.git
cd noor-studio
```

### ۲. راه‌اندازی بک‌اند
```bash
cd backend
cp .env.example .env
nano .env          # رمز و اطلاعات رو تنظیم کنید
npm install
npm start          # یا با pm2: pm2 start server.js --name noor-api
```

### ۳. راه‌اندازی فرانت‌اند
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=https://your-domain.com/api  ← آدرس بک‌اند رو بذارید
npm install
npm run build      # خروجی در پوشه dist/
```

### ۴. سرو فرانت با Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/noor-studio/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
    }
    location /uploads {
        proxy_pass http://localhost:4000;
    }
}
```

---

## 🎛 پنل ادمین

- **آدرس:** `https://yourdomain.com/?admin`
- **نام کاربری:** مقدار `ADMIN_USERNAME` در `.env`
- **رمز عبور:** مقدار `ADMIN_PASSWORD` در `.env`

### امکانات پنل:
| بخش | قابلیت‌ها |
|-----|-----------|
| آیتم‌های گالری | افزودن، ویرایش، حذف، فیلتر بر اساس دسته |
| دسته‌بندی‌ها | افزودن و حذف دسته‌بندی |
| آپلود تصویر | مستقیم از فرم — JPG/PNG/WEBP تا ۱۰MB |

---

## 🔌 API Endpoints

| Method | Route | توضیح |
|--------|-------|-------|
| GET | `/api/items` | لیست آیتم‌ها (با `?category=wedding` فیلتر) |
| GET | `/api/categories` | لیست دسته‌بندی‌ها |
| POST | `/api/admin/login` | ورود ادمین |
| POST | `/api/admin/items` | افزودن آیتم |
| PUT | `/api/admin/items/:id` | ویرایش آیتم |
| DELETE | `/api/admin/items/:id` | حذف آیتم |
| POST | `/api/admin/categories` | افزودن دسته‌بندی |
| DELETE | `/api/admin/categories/:id` | حذف دسته‌بندی |
