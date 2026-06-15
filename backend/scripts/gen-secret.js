#!/usr/bin/env node
// Generate secure values for backend/.env
//   node scripts/gen-secret.js                 -> prints a JWT_SECRET
//   node scripts/gen-secret.js "my password"   -> also prints ADMIN_PASSWORD_HASH

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const secret = crypto.randomBytes(48).toString('hex');
console.log('JWT_SECRET=' + secret);

const password = process.argv[2];
if (password) {
  const hash = bcrypt.hashSync(password, 12);
  console.log('ADMIN_PASSWORD_HASH=' + hash);
  console.log('# (remove any plain ADMIN_PASSWORD line when using a hash)');
} else {
  console.log('# Tip: pass a password to also get a hash:');
  console.log('#   node scripts/gen-secret.js "your-strong-password"');
}
