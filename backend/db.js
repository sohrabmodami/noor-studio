// ── SQLite database layer for Noor Studio ──
// Real database (single file). Replaces the old data.json storage.
// On first run, if a legacy data.json exists (e.g. on the VPS), its
// contents are migrated automatically so nothing is lost.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const dbFile = process.env.DB_FILE || path.join(__dirname, 'noor.db');
const legacyDataFile = path.join(__dirname, 'data.json');

const db = new Database(dbFile);
db.pragma('journal_mode = WAL'); // safer concurrent reads/writes

// ── Schema ──
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id    TEXT PRIMARY KEY,
    label TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    categoryId  TEXT NOT NULL,
    categoryIds TEXT,
    description TEXT DEFAULT '',
    imageUrl    TEXT,
    createdAt   TEXT,
    updatedAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS slides (
    id        TEXT PRIMARY KEY,
    tag       TEXT,
    imageUrl  TEXT,
    "order"   INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`);

// ── Lightweight migrations for slides (add title/subtitle if missing) ──
const slideCols = db.prepare('PRAGMA table_info(slides)').all().map(c => c.name);
if (!slideCols.includes('title'))    db.exec('ALTER TABLE slides ADD COLUMN title TEXT');
if (!slideCols.includes('subtitle')) db.exec('ALTER TABLE slides ADD COLUMN subtitle TEXT');

// ── Lightweight migration for gallery multi-category support ──
const itemCols = db.prepare('PRAGMA table_info(items)').all().map(c => c.name);
if (!itemCols.includes('categoryIds')) {
  db.exec('ALTER TABLE items ADD COLUMN categoryIds TEXT');
}
db.prepare("SELECT id, categoryId FROM items WHERE categoryIds IS NULL OR categoryIds = ''").all()
  .forEach(item => {
    db.prepare('UPDATE items SET categoryIds = ? WHERE id = ?')
      .run(JSON.stringify([item.categoryId].filter(Boolean)), item.id);
  });

// ── Seed / migrate on first run ──
function isEmpty() {
  const c = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
  const s = db.prepare('SELECT COUNT(*) AS n FROM slides').get().n;
  return c === 0 && s === 0;
}

function migrateFromJson() {
  let imported = false;
  if (fs.existsSync(legacyDataFile)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyDataFile, 'utf-8'));
      const tx = db.transaction((data) => {
        (data.categories || []).forEach(c =>
          db.prepare('INSERT OR IGNORE INTO categories (id, label) VALUES (?, ?)').run(c.id, c.label));
        (data.items || []).forEach(i => {
          const categoryIds = Array.isArray(i.categoryIds) && i.categoryIds.length
            ? i.categoryIds
            : [i.categoryId].filter(Boolean);
          db.prepare(`INSERT OR IGNORE INTO items
            (id, title, categoryId, categoryIds, description, imageUrl, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
            i.id, i.title, categoryIds[0] || i.categoryId, JSON.stringify(categoryIds),
            i.description || '', i.imageUrl || null,
            i.createdAt || new Date().toISOString(), i.updatedAt || null);
        });
        (data.slides || []).forEach(s =>
          db.prepare('INSERT OR IGNORE INTO slides (id, tag, imageUrl, "order") VALUES (?, ?, ?, ?)')
            .run(s.id, s.tag, s.imageUrl || null, s.order || 0));
        if (data.logoUrl) setSetting('logoUrl', data.logoUrl);
      });
      tx(legacy);
      imported = true;
      // keep a backup of the old file, then stop using it
      fs.renameSync(legacyDataFile, legacyDataFile + '.migrated');
      console.log('✅  Migrated legacy data.json into SQLite');
    } catch (e) {
      console.error('⚠️  Failed to migrate data.json:', e.message);
    }
  }
  return imported;
}

function seedDefaults() {
  const cats = [
    { id: 'wedding',    label: 'عروسی' },
    { id: 'portrait',   label: 'پرتره' },
    { id: 'family',     label: 'خانوادگی' },
    { id: 'commercial', label: 'تجاری' },
    { id: 'nature',     label: 'طبیعت' },
  ];
  cats.forEach(c =>
    db.prepare('INSERT OR IGNORE INTO categories (id, label) VALUES (?, ?)').run(c.id, c.label));

  const slides = [
    { tag: 'عکاسی عروسی',    title: 'لحظه‌های عاشقانه‌ی شما',    subtitle: 'ثبت زیباترین روز زندگی‌تان با نگاهی هنری و صمیمی.', order: 0 },
    { tag: 'پرتره حرفه‌ای',  title: 'چهره‌ی شما، داستان شما',      subtitle: 'پرتره‌هایی که شخصیت و حس واقعی‌تان را نشان می‌دهند.', order: 1 },
    { tag: 'عکاسی خانوادگی', title: 'خاطره‌های ماندگار خانواده',  subtitle: 'گرمای کنار هم بودن را برای همیشه قاب می‌گیریم.', order: 2 },
  ];
  slides.forEach(s =>
    db.prepare('INSERT INTO slides (id, tag, title, subtitle, imageUrl, "order") VALUES (?, ?, ?, ?, NULL, ?)')
      .run(randomUUID(), s.tag, s.title, s.subtitle, s.order));
}

if (isEmpty()) {
  const migrated = migrateFromJson();
  if (!migrated) seedDefaults();
}

// ── Settings helpers ──
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}
function setSetting(key, value) {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
}

module.exports = { db, getSetting, setSetting };
