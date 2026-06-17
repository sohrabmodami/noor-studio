require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const { db, getSetting, setSetting } = require('./db');
const cfg = require('./config');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = cfg.JWT_SECRET;

// ── Default editable section content ──
// Stored in settings under key "content" as JSON. The public GET merges
// saved values over these defaults so the site never renders blank.
const DEFAULT_CONTENT = {
  hero: {
    badge: '✦ استودیو عکاسی نور',
    btnPrimaryText: 'مشاهده گالری',
    btnPrimaryLink: '#gallery',
    btnSecondaryText: 'مشاوره رایگان',
    btnSecondaryLink: '#cta',
  },
  process: {
    eyebrow: 'فرآیند کار',
    title: 'چطور باهم کار می‌کنیم؟',
    steps: [
      { n: '۰۱', title: 'مشاوره رایگان', desc: 'یک جلسه آنلاین یا حضوری برای آشنایی با سلیقه و نیاز شما.' },
      { n: '۰۲', title: 'برنامه‌ریزی',  desc: 'انتخاب لوکیشن، تاریخ و تنظیم جزئیات پروژه با هم.' },
      { n: '۰۳', title: 'روز عکاسی',    desc: 'یک تجربه راحت و صمیمی — فقط خودتان باشید!' },
      { n: '۰۴', title: 'تحویل آثار',   desc: 'ویرایش حرفه‌ای و تحویل فایل‌ها در ۳ تا ۴ هفته.' },
    ],
  },
  cta: {
    title: 'آماده‌اید لحظاتتان را جاودان کنید؟',
    text: 'همین الان رزرو کنید — اولین مشاوره کاملاً رایگان است.',
    btnPrimaryText: 'ارسال ایمیل',
    btnPrimaryLink: 'mailto:Maryam.daemii@gmail.com',
    btnSecondaryText: 'اینستاگرام ما',
    btnSecondaryLink: 'https://instagram.com',
  },
  footer: {
    brand: 'نور استودیو',
    copyright: '© ۱۴۰۵ — تمامی حقوق محفوظ است',
    instagram: '#',
    telegram: '#',
    whatsapp: '#',
  },
};

// Deep-merge saved content over defaults (one level into each section).
function mergeContent(saved) {
  const out = {};
  for (const section of Object.keys(DEFAULT_CONTENT)) {
    out[section] = { ...DEFAULT_CONTENT[section], ...(saved?.[section] || {}) };
  }
  return out;
}

app.set('trust proxy', 1); // behind nginx — needed for correct rate-limit IPs

// ── Security middleware ──
app.use(helmet());

// CORS: restrict to configured origins in production; allow all in dev.
app.use(cors({
  origin: cfg.ALLOWED_ORIGINS.length ? cfg.ALLOWED_ORIGINS : '*',
}));
app.use(express.json({ limit: '100kb' }));

// General abuse protection across the whole API.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Uploads dir ──
// nosniff + force-download so an uploaded SVG/HTML can never execute inline.
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'");
  },
}));

// ── Multer (image upload) ──
// SVG intentionally excluded — it can carry executable scripts (XSS).
// Extension is derived from the mimetype map, never from the uploaded
// filename, so a malicious name like "shell.php" can't reach disk.
const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
  'image/gif':  '.gif',
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${randomUUID()}${MIME_EXT[file.mimetype] || ''}`),
});
const fileFilter = (req, file, cb) => {
  MIME_EXT[file.mimetype] ? cb(null, true) : cb(new Error('فقط فایل تصویری مجاز است'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

function deleteUpload(imageUrl) {
  if (!imageUrl) return;
  const p = path.join(__dirname, imageUrl);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

// ── Auth Middleware ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'توکن یافت نشد' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'توکن نامعتبر است' });
  }
}

// ══════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════

// GET all items (with optional category filter)
app.get('/api/items', (req, res) => {
  const { category } = req.query;
  const items = category && category !== 'all'
    ? db.prepare('SELECT * FROM items WHERE categoryId = ? ORDER BY createdAt DESC').all(category)
    : db.prepare('SELECT * FROM items ORDER BY createdAt DESC').all();
  res.json(items);
});

// GET all categories
app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories').all());
});

// GET logo (public)
app.get('/api/logo', (req, res) => {
  res.json({ logoUrl: getSetting('logoUrl') });
});

// GET slides (public)
app.get('/api/slides', (req, res) => {
  res.json(db.prepare('SELECT * FROM slides ORDER BY "order" ASC').all());
});

// GET editable section content (public, merged with defaults)
app.get('/api/content', (req, res) => {
  let saved = null;
  try { saved = JSON.parse(getSetting('content') || 'null'); } catch { saved = null; }
  res.json(mergeContent(saved));
});

// ══════════════════════════════════════
//  AUTH
// ══════════════════════════════════════

// Brute-force protection: max 10 attempts per IP per 15 min.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تلاش‌های زیاد. لطفاً کمی بعد دوباره امتحان کنید.' },
});

// Constant-time string compare to avoid timing attacks.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  const validUser = safeEqual(username || '', cfg.ADMIN_USERNAME);
  const validPass = cfg.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(String(password || ''), cfg.ADMIN_PASSWORD_HASH)
    : safeEqual(password || '', cfg.ADMIN_PASSWORD);
  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'نام کاربری یا رمز اشتباه است' });
  }
  const token = jwt.sign({ username: cfg.ADMIN_USERNAME, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: cfg.ADMIN_USERNAME });
});

// ══════════════════════════════════════
//  ADMIN — LOGO
// ══════════════════════════════════════

app.post('/api/admin/logo', authMiddleware, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
  deleteUpload(getSetting('logoUrl'));
  const logoUrl = `/uploads/${req.file.filename}`;
  setSetting('logoUrl', logoUrl);
  res.json({ logoUrl });
});

app.delete('/api/admin/logo', authMiddleware, (req, res) => {
  deleteUpload(getSetting('logoUrl'));
  setSetting('logoUrl', null);
  res.json({ logoUrl: null });
});

// ══════════════════════════════════════
//  ADMIN — SLIDES
// ══════════════════════════════════════

// Create a new slide (optionally with image).
app.post('/api/admin/slides', authMiddleware, upload.single('image'), (req, res) => {
  const { tag, title, subtitle } = req.body;
  const maxOrder = db.prepare('SELECT MAX("order") AS m FROM slides').get().m;
  const slide = {
    id: randomUUID(),
    tag: tag || null,
    title: title || null,
    subtitle: subtitle || null,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    order: (maxOrder == null ? -1 : maxOrder) + 1,
  };
  db.prepare(`INSERT INTO slides (id, tag, title, subtitle, imageUrl, "order")
    VALUES (@id, @tag, @title, @subtitle, @imageUrl, @order)`).run(slide);
  res.status(201).json(slide);
});

app.put('/api/admin/slides/:id', authMiddleware, upload.single('image'), (req, res) => {
  const slide = db.prepare('SELECT * FROM slides WHERE id = ?').get(req.params.id);
  if (!slide) return res.status(404).json({ error: 'اسلاید یافت نشد' });

  const { tag, title, subtitle, order } = req.body;
  if (req.file && slide.imageUrl) deleteUpload(slide.imageUrl);

  const updated = {
    id: slide.id,
    tag:      tag      !== undefined ? tag      : slide.tag,
    title:    title    !== undefined ? title    : slide.title,
    subtitle: subtitle !== undefined ? subtitle : slide.subtitle,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : slide.imageUrl,
    order:    order    !== undefined ? Number(order) : slide.order,
  };
  db.prepare(`UPDATE slides SET tag = @tag, title = @title, subtitle = @subtitle,
    imageUrl = @imageUrl, "order" = @order WHERE id = @id`).run(updated);
  res.json(db.prepare('SELECT * FROM slides WHERE id = ?').get(slide.id));
});

// Delete an entire slide (and its image).
app.delete('/api/admin/slides/:id', authMiddleware, (req, res) => {
  const slide = db.prepare('SELECT * FROM slides WHERE id = ?').get(req.params.id);
  if (!slide) return res.status(404).json({ error: 'اسلاید یافت نشد' });
  deleteUpload(slide.imageUrl);
  db.prepare('DELETE FROM slides WHERE id = ?').run(slide.id);
  res.json({ message: 'حذف شد' });
});

app.delete('/api/admin/slides/:id/image', authMiddleware, (req, res) => {
  const slide = db.prepare('SELECT * FROM slides WHERE id = ?').get(req.params.id);
  if (!slide) return res.status(404).json({ error: 'اسلاید یافت نشد' });
  if (slide.imageUrl) {
    deleteUpload(slide.imageUrl);
    db.prepare('UPDATE slides SET imageUrl = NULL WHERE id = ?').run(slide.id);
  }
  res.json(db.prepare('SELECT * FROM slides WHERE id = ?').get(slide.id));
});

// ══════════════════════════════════════
//  ADMIN — CONTENT (section text)
// ══════════════════════════════════════

app.put('/api/admin/content', authMiddleware, (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const merged = mergeContent(body);
  setSetting('content', JSON.stringify(merged));
  res.json(merged);
});

// ══════════════════════════════════════
//  ADMIN — ITEMS
// ══════════════════════════════════════

app.get('/api/admin/items', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM items ORDER BY createdAt DESC').all());
});

app.post('/api/admin/items', authMiddleware, upload.single('image'), (req, res) => {
  const { title, categoryId, description } = req.body;
  if (!title || !categoryId) {
    return res.status(400).json({ error: 'عنوان و دسته‌بندی الزامی است' });
  }
  const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
  if (!cat) return res.status(400).json({ error: 'دسته‌بندی وجود ندارد' });

  const newItem = {
    id: randomUUID(),
    title,
    categoryId,
    description: description || '',
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  db.prepare(`INSERT INTO items (id, title, categoryId, description, imageUrl, createdAt, updatedAt)
    VALUES (@id, @title, @categoryId, @description, @imageUrl, @createdAt, @updatedAt)`).run(newItem);
  res.status(201).json(newItem);
});

app.put('/api/admin/items/:id', authMiddleware, upload.single('image'), (req, res) => {
  const oldItem = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!oldItem) return res.status(404).json({ error: 'آیتم یافت نشد' });

  const { title, categoryId, description } = req.body;
  if (req.file && oldItem.imageUrl) deleteUpload(oldItem.imageUrl);

  const updated = {
    id: oldItem.id,
    title: title || oldItem.title,
    categoryId: categoryId || oldItem.categoryId,
    description: description !== undefined ? description : oldItem.description,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : oldItem.imageUrl,
    updatedAt: new Date().toISOString(),
  };
  db.prepare(`UPDATE items SET title = @title, categoryId = @categoryId,
    description = @description, imageUrl = @imageUrl, updatedAt = @updatedAt
    WHERE id = @id`).run(updated);
  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(oldItem.id));
});

app.delete('/api/admin/items/:id', authMiddleware, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'آیتم یافت نشد' });
  deleteUpload(item.imageUrl);
  db.prepare('DELETE FROM items WHERE id = ?').run(item.id);
  res.json({ message: 'حذف شد' });
});

// ══════════════════════════════════════
//  ADMIN — CATEGORIES
// ══════════════════════════════════════

app.post('/api/admin/categories', authMiddleware, (req, res) => {
  const { id, label } = req.body;
  if (!id || !label) return res.status(400).json({ error: 'id و label الزامی است' });
  const exists = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (exists) return res.status(400).json({ error: 'این دسته‌بندی قبلاً وجود دارد' });
  db.prepare('INSERT INTO categories (id, label) VALUES (?, ?)').run(id, label);
  res.status(201).json({ id, label });
});

app.delete('/api/admin/categories/:id', authMiddleware, (req, res) => {
  const hasItems = db.prepare('SELECT 1 FROM items WHERE categoryId = ? LIMIT 1').get(req.params.id);
  if (hasItems) return res.status(400).json({ error: 'این دسته‌بندی دارای آیتم است' });
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'دسته‌بندی حذف شد' });
});

// ── Error handler (clean JSON for upload / multer errors) ──
app.use((err, req, res, _next) => {
  const isUploadErr = err instanceof multer.MulterError ||
    /فقط فایل تصویری/.test(err.message || '');
  if (isUploadErr) {
    return res.status(400).json({ error: err.message || 'خطا در آپلود فایل' });
  }
  console.error(err);
  res.status(500).json({ error: 'خطای داخلی سرور' });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`✅  Noor Studio API (SQLite) running on http://localhost:${PORT}`);
  console.log(`    mode=${cfg.isProd ? 'production' : 'development'}` +
    `, cors=${cfg.ALLOWED_ORIGINS.length ? cfg.ALLOWED_ORIGINS.join(',') : '*'}` +
    `, passwordHash=${cfg.ADMIN_PASSWORD_HASH ? 'yes' : 'no'}`);
});
