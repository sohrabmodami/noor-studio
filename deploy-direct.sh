#!/usr/bin/env bash
set -euo pipefail

# Optional local-only config. Keep secrets here instead of hardcoding them
# in this script. This file is ignored by git.
if [ -f .deploy.env ]; then
  set -a
  # shellcheck disable=SC1091
  source .deploy.env
  set +a
fi

SSH_HOST="${SSH_HOST:-87.248.156.107}"
SSH_PORT="${SSH_PORT:-9011}"
SSH_USER="${SSH_USER:-root}"
APP_DIR="${APP_DIR:-/var/www/noor-studio}"
WEBROOT="${WEBROOT:-/var/www/noor-studio/dist}"
SERVICE_NAME="${SERVICE_NAME:-noor-backend}"
SYNC_LOCAL_DATA="${SYNC_LOCAL_DATA:-0}"
# SKIP_NPM=1 skips installing backend deps on the server. Required when the
# server has no outbound internet (npm ci would delete node_modules then fail).
SKIP_NPM="${SKIP_NPM:-0}"
DEPLOY_REPLACE_SERVER_DATA="${DEPLOY_REPLACE_SERVER_DATA:-no}"
BACKEND_DIR="$APP_DIR/backend"
STAMP="$(date +%Y%m%d-%H%M%S)"

SSH_BASE="ssh -p $SSH_PORT -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30"
RSYNC_SSH_BASE="ssh -p $SSH_PORT -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30"
if [ -n "${DEPLOY_SSH_PASSWORD:-}" ]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "ERROR: DEPLOY_SSH_PASSWORD is set, but sshpass is not installed."
    echo "Install it with: brew install hudochenkov/sshpass/sshpass"
    exit 1
  fi
  export SSHPASS="$DEPLOY_SSH_PASSWORD"
  SSH="sshpass -e $SSH_BASE"
  RSYNC_SSH="sshpass -e $RSYNC_SSH_BASE"
else
  SSH="$SSH_BASE"
  RSYNC_SSH="$RSYNC_SSH_BASE"
fi
REMOTE="$SSH_USER@$SSH_HOST"

echo "==> Noor Studio deploy"
echo "    Remote:  $REMOTE:$SSH_PORT"
echo "    App dir: $APP_DIR"
echo "    Webroot: $WEBROOT"
echo "    Service: $SERVICE_NAME"
if [ "$SYNC_LOCAL_DATA" = "1" ]; then
  echo "    Data:    syncing local SQLite DB and uploads to server"
  if [ "$DEPLOY_REPLACE_SERVER_DATA" != "yes" ]; then
    echo
    echo "ERROR: SYNC_LOCAL_DATA=1 will replace the server SQLite DB and uploads with local files."
    echo "This can make previous server gallery/content disappear."
    echo "Run again with DEPLOY_REPLACE_SERVER_DATA=yes only if you really want this:"
    echo "  SYNC_LOCAL_DATA=1 DEPLOY_REPLACE_SERVER_DATA=yes ./deploy-direct.sh"
    exit 1
  fi
else
  echo "    Data:    keeping server SQLite DB and uploads"
fi

echo "==> Installing frontend dependencies if needed"
if [ ! -d node_modules ]; then
  npm install
fi

echo "==> Building frontend"
npm run build

echo "==> Preparing server and creating backups"
$SSH "$REMOTE" "set -e
  mkdir -p '$APP_DIR' '$BACKEND_DIR' '$APP_DIR/backups'
  if [ -f '$BACKEND_DIR/noor.db' ]; then
    # IMPORTANT: live data may sit in the -wal file (uncheckpointed). A bare
    # 'cp noor.db' silently loses it. Take a consistent snapshot via sqlite3
    # .backup when available; otherwise copy the db + its -wal/-shm sidecars.
    if command -v sqlite3 >/dev/null 2>&1; then
      sqlite3 '$BACKEND_DIR/noor.db' \".backup '$APP_DIR/backups/noor.db.$STAMP.bak'\"
    else
      cp '$BACKEND_DIR/noor.db' '$APP_DIR/backups/noor.db.$STAMP.bak'
      [ -f '$BACKEND_DIR/noor.db-wal' ] && cp '$BACKEND_DIR/noor.db-wal' '$APP_DIR/backups/noor.db-wal.$STAMP.bak' || true
      [ -f '$BACKEND_DIR/noor.db-shm' ] && cp '$BACKEND_DIR/noor.db-shm' '$APP_DIR/backups/noor.db-shm.$STAMP.bak' || true
    fi
    echo 'DB backup: $APP_DIR/backups/noor.db.$STAMP.bak'
  else
    echo 'No existing DB found; skipping DB backup'
  fi
  if [ -d '$BACKEND_DIR/uploads' ]; then
    tar -C '$BACKEND_DIR' -czf '$APP_DIR/backups/uploads.$STAMP.tgz' uploads
    echo 'Uploads backup: $APP_DIR/backups/uploads.$STAMP.tgz'
  else
    echo 'No uploads dir found; skipping uploads backup'
  fi
"

echo "==> Uploading frontend build"
$SSH "$REMOTE" "mkdir -p '$WEBROOT/assets'"
rsync -az --delete -e "$RSYNC_SSH" dist/assets/ "$REMOTE:$WEBROOT/assets/"
rsync -az -e "$RSYNC_SSH" dist/index.html "$REMOTE:$WEBROOT/index.html"
if [ -f dist/.htaccess ]; then
  rsync -az -e "$RSYNC_SSH" dist/.htaccess "$REMOTE:$WEBROOT/.htaccess"
fi

echo "==> Uploading backend code without database, uploads, or env"
rsync -az --delete -e "$RSYNC_SSH" \
  --exclude '.env' \
  --exclude 'noor.db' \
  --exclude 'noor.db-*' \
  --exclude 'uploads/' \
  --exclude 'node_modules/' \
  backend/ "$REMOTE:$BACKEND_DIR/"

if [ "$SYNC_LOCAL_DATA" = "1" ]; then
  echo "==> Stopping backend before replacing server data"
  $SSH "$REMOTE" "set -e
    if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files | grep -q '^$SERVICE_NAME.service'; then
      systemctl stop '$SERVICE_NAME' || true
    elif command -v pm2 >/dev/null 2>&1; then
      pm2 stop '$SERVICE_NAME' || true
    fi
  "

  # Guard: refuse to push an empty/near-empty local DB over the server unless
  # explicitly forced. A local DB with 0 gallery items is almost always a
  # mistake that would wipe the server's real content.
  if [ -f backend/noor.db ] && command -v python3 >/dev/null 2>&1; then
    LOCAL_ITEMS="$(python3 - <<'PY'
import sqlite3
try:
    c = sqlite3.connect('backend/noor.db')
    print(c.execute('SELECT COUNT(*) FROM items').fetchone()[0])
except Exception:
    print('?')
PY
)"
    echo "    Local DB gallery items: $LOCAL_ITEMS"
    if [ "$LOCAL_ITEMS" = "0" ] && [ "${ALLOW_EMPTY_DB_SYNC:-no}" != "yes" ]; then
      echo "ERROR: local backend/noor.db has 0 items. Refusing to overwrite server data."
      echo "If you really mean it, re-run with ALLOW_EMPTY_DB_SYNC=yes"
      exit 1
    fi
  fi

  echo "==> Uploading local database and uploads to server"
  rsync -az -e "$RSYNC_SSH" backend/noor.db* "$REMOTE:$BACKEND_DIR/" 2>/dev/null || {
    echo "ERROR: No local backend/noor.db files found to sync."
    exit 1
  }
  if [ -d backend/uploads ]; then
    rsync -az --delete -e "$RSYNC_SSH" backend/uploads/ "$REMOTE:$BACKEND_DIR/uploads/"
  fi
fi

echo "==> Ensuring backend dependencies and restarting service"
$SSH "$REMOTE" "set -e
  cd '$BACKEND_DIR'
  if [ ! -f .env ]; then
    echo 'ERROR: $BACKEND_DIR/.env is missing. Restore/create it before running backend.'
    exit 1
  fi
  if [ '$SKIP_NPM' = '1' ]; then
    echo 'SKIP_NPM=1: skipping dependency install (server is offline; reusing existing node_modules).'
    if [ ! -d node_modules ] || [ ! -e node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then
      echo 'ERROR: SKIP_NPM=1 but node_modules (or the better-sqlite3 native binary) is missing.'
      echo 'Build a linux node_modules bundle and rsync it to backend/node_modules before deploying.'
      exit 1
    fi
  elif [ -f package-lock.json ]; then
    npm ci --omit=dev
  else
    npm install --omit=dev
  fi
  if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files | grep -q '^$SERVICE_NAME.service'; then
    systemctl restart '$SERVICE_NAME'
    systemctl is-active '$SERVICE_NAME'
  elif command -v pm2 >/dev/null 2>&1; then
    pm2 restart '$SERVICE_NAME' || pm2 start server.js --name '$SERVICE_NAME'
    pm2 save || true
  else
    echo 'WARNING: no systemd service or pm2 found. Backend code uploaded but not restarted.'
  fi
"

echo "==> Verifying backend health from server"
$SSH "$REMOTE" "set -e
  if command -v curl >/dev/null 2>&1; then
    curl -fsS 'http://127.0.0.1:4000/api/categories' >/dev/null
    echo 'Backend API responded on 127.0.0.1:4000'
  else
    echo 'curl is not installed on server; skipped API check'
  fi
"

echo "==> Done"
echo "Frontend: $WEBROOT"
echo "Backend:  $BACKEND_DIR"
