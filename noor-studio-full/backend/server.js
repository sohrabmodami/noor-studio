require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'noor_secret_key';

// ── Middleware ──
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Ensure directories exist ──
const uploadsDir = path.join(__dirname, 'uploads');
const dataFile = path.join(__dirname, 'data.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── DB (JSON file) ──
function readDB() {
  if (!fs.existsSync(dataFile)) {
    const initial = {
      categories: [
        { id: 'wedding',    label: 'عروسی' },
        { id: 'portrait',   label: 'پرتره' },
        { id: 'family',     label: 'خانوادگی' },
        { id: 'commercial', label: 'تجاری' },
        { id: 'nature',     label: 'طبیعت' }
      ],
      items: [],
      slides: [
        { id: uuidv4(), tag: 'عکاسی عروسی',    imageUrl: null, order: 0 },
        { id: uuidv4(), tag: 'پرتره حرفه‌ای',  imageUrl: null, order: 1 },
        { id: uuidv4(), tag: 'عکاسی خانوادگی', imageUrl: null, order: 2 }
      ]
    };
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2));
    return initial;
  }
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  // migrate: add slides if missing
  if (!db.slides) {
    db.slides = [
      { id: uuidv4(), tag: 'عکاسی عروسی',    imageUrl: null, order: 0 },
      { id: uuidv4(), tag: 'پرتره حرفه‌ای',  imageUrl: null, order: 1 },
      { id: uuidv4(), tag: 'عکاسی خانوادگی', imageUrl: null, order: 2 }
    ];
    writeDB(db);
  }
  return db;
}

function writeDB(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// ── Multer (image upload) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('فقط فایل تصویری مجاز است'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

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
  const db = readDB();
  const { category } = req.query;
  const items = category && category !== 'all'
    ? db.items.filter(i => i.categoryId === category)
    : db.items;
  res.json(items);
});

// GET all categories
app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

// GET logo (public)
app.get('/api/logo', (req, res) => {
  const db = readDB();
  res.json({ logoUrl: db.logoUrl || null });
});

// POST upload logo (admin)
app.post('/api/admin/logo', authMiddleware, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
  const db = readDB();
  // delete old logo file
  if (db.logoUrl) {
    const old = path.join(__dirname, db.logoUrl);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  db.logoUrl = `/uploads/${req.file.filename}`;
  writeDB(db);
  res.json({ logoUrl: db.logoUrl });
});

// DELETE logo (admin)
app.delete('/api/admin/logo', authMiddleware, (req, res) => {
  const db = readDB();
  if (db.logoUrl) {
    const old = path.join(__dirname, db.logoUrl);
    if (fs.existsSync(old)) fs.unlinkSync(old);
    db.logoUrl = null;
    writeDB(db);
  }
  res.json({ logoUrl: null });
});

// GET slides (public)
app.get('/api/slides', (req, res) => {
  const db = readDB();
  res.json([...db.slides].sort((a, b) => a.order - b.order));
});

// ══════════════════════════════════════
//  ADMIN — SLIDES
// ══════════════════════════════════════

// PUT update slide (tag + optional image)
app.put('/api/admin/slides/:id', authMiddleware, upload.single('image'), (req, res) => {
  const db  = readDB();
  const idx = db.slides.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'اسلاید یافت نشد' });

  const { tag } = req.body;
  const slide   = db.slides[idx];

  if (req.file && slide.imageUrl) {
    const oldPath = path.join(__dirname, slide.imageUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  db.slides[idx] = {
    ...slide,
    tag:      tag !== undefined ? tag : slide.tag,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : slide.imageUrl,
  };
  writeDB(db);
  res.json(db.slides[idx]);
});

// DELETE slide image (keep slide, just remove image)
app.delete('/api/admin/slides/:id/image', authMiddleware, (req, res) => {
  const db  = readDB();
  const idx = db.slides.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'اسلاید یافت نشد' });

  const slide = db.slides[idx];
  if (slide.imageUrl) {
    const filePath = path.join(__dirname, slide.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.slides[idx].imageUrl = null;
    writeDB(db);
  }
  res.json(db.slides[idx]);
});

// ══════════════════════════════════════
//  AUTH
// ══════════════════════════════════════

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const validUser = username === (process.env.ADMIN_USERNAME || 'admin');
  const validPass = password === (process.env.ADMIN_PASSWORD || 'noor1234');
  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'نام کاربری یا رمز اشتباه است' });
  }
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

// ══════════════════════════════════════
//  ADMIN — ITEMS
// ══════════════════════════════════════

// GET all items (admin)
app.get('/api/admin/items', authMiddleware, (req, res) => {
  const db = readDB();
  res.json(db.items);
});

// POST create item (with image upload)
app.post('/api/admin/items', authMiddleware, upload.single('image'), (req, res) => {
  const { title, categoryId, description } = req.body;
  if (!title || !categoryId) {
    return res.status(400).json({ error: 'عنوان و دسته‌بندی الزامی است' });
  }
  const db = readDB();
  const catExists = db.categories.find(c => c.id === categoryId);
  if (!catExists) return res.status(400).json({ error: 'دسته‌بندی وجود ندارد' });

  const newItem = {
    id: uuidv4(),
    title,
    categoryId,
    description: description || '',
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString()
  };
  db.items.unshift(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

// PUT update item
app.put('/api/admin/items/:id', authMiddleware, upload.single('image'), (req, res) => {
  const db = readDB();
  const idx = db.items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'آیتم یافت نشد' });

  const { title, categoryId, description } = req.body;
  const oldItem = db.items[idx];

  // if new image uploaded, delete old file
  if (req.file && oldItem.imageUrl) {
    const oldPath = path.join(__dirname, oldItem.imageUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  db.items[idx] = {
    ...oldItem,
    title: title || oldItem.title,
    categoryId: categoryId || oldItem.categoryId,
    description: description !== undefined ? description : oldItem.description,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : oldItem.imageUrl,
    updatedAt: new Date().toISOString()
  };
  writeDB(db);
  res.json(db.items[idx]);
});

// DELETE item
app.delete('/api/admin/items/:id', authMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'آیتم یافت نشد' });

  const item = db.items[idx];
  if (item.imageUrl) {
    const filePath = path.join(__dirname, item.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.items.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'حذف شد' });
});

// ══════════════════════════════════════
//  ADMIN — CATEGORIES
// ══════════════════════════════════════

// POST create category
app.post('/api/admin/categories', authMiddleware, (req, res) => {
  const { id, label } = req.body;
  if (!id || !label) return res.status(400).json({ error: 'id و label الزامی است' });
  const db = readDB();
  if (db.categories.find(c => c.id === id)) {
    return res.status(400).json({ error: 'این دسته‌بندی قبلاً وجود دارد' });
  }
  const newCat = { id, label };
  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json(newCat);
});

// DELETE category (only if no items use it)
app.delete('/api/admin/categories/:id', authMiddleware, (req, res) => {
  const db = readDB();
  const hasItems = db.items.some(i => i.categoryId === req.params.id);
  if (hasItems) return res.status(400).json({ error: 'این دسته‌بندی دارای آیتم است' });
  db.categories = db.categories.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'دسته‌بندی حذف شد' });
});

// ── Start ──
app.listen(PORT, () => console.log(`✅  Noor Studio API running on http://localhost:${PORT}`));
