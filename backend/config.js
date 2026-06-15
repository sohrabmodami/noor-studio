// ── Security configuration & startup guards ──
// Centralises secrets handling so the server fails loudly in production
// when left with weak/default credentials.

const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production';

const WEAK_SECRETS = [
  '', 'noor_secret_key', 'change_this_secret',
  'your_super_secret_key_change_this', 'change_this_to_a_long_random_secret',
];
const WEAK_PASSWORDS = ['', 'noor1234', 'admin', 'password'];

// ── JWT secret ──
let JWT_SECRET = process.env.JWT_SECRET || '';
if (WEAK_SECRETS.includes(JWT_SECRET)) {
  if (isProd) {
    console.error('❌  JWT_SECRET is missing or weak. Set a strong random JWT_SECRET in production and restart.');
    console.error('    Generate one with: node scripts/gen-secret.js');
    process.exit(1);
  }
  // dev convenience: ephemeral secret (tokens reset on restart)
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('⚠️  No strong JWT_SECRET set — using a temporary one (dev only). Tokens reset on restart.');
}

// ── Admin credentials ──
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';   // preferred (bcrypt)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'noor1234';      // fallback (plain)

if (isProd && !ADMIN_PASSWORD_HASH && WEAK_PASSWORDS.includes(ADMIN_PASSWORD)) {
  console.error('❌  Admin password is weak/default in production.');
  console.error('    Set ADMIN_PASSWORD_HASH (recommended) or a strong ADMIN_PASSWORD and restart.');
  console.error('    Generate a hash with: node scripts/gen-secret.js "your-password"');
  process.exit(1);
}

// ── Allowed CORS origins ──
// Comma-separated list in ALLOWED_ORIGINS, e.g. "https://noor.wgtn.online".
// In dev (no list) we allow everything for convenience.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

module.exports = {
  isProd,
  JWT_SECRET,
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH,
  ADMIN_PASSWORD,
  ALLOWED_ORIGINS,
};
