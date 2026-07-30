#!/usr/bin/env bash

# ========================================================
# JIV FLEET PLATFORM - AUTOMATED BACKUP SCRIPT
# Bare-Metal & Cloud Migration Backup Utility
# ========================================================

set -euo pipefail

BACKUP_DIR="${1:-/opt/jiv-backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/jiv_fleet_backup_${TIMESTAMP}"

mkdir -p "${BACKUP_PATH}"

echo "📦 Starting JIV Fleet Backup at ${TIMESTAMP}..."

# 1. Backup PostgreSQL Database
if docker ps | grep -q jiv-fleet-db; then
    echo "💾 Dumping PostgreSQL database..."
    docker exec jiv-fleet-db pg_dump -U jiv_admin jiv_fleet_db | gzip > "${BACKUP_PATH}/database.sql.gz"
    echo "✅ Database dump saved to ${BACKUP_PATH}/database.sql.gz"
else
    echo "⚠️ Database container not running, skipping database dump."
fi

# 2. Backup Application Configuration (.env)
if [ -f "/opt/jiv-vladivostok-fleet/.env" ]; then
    cp "/opt/jiv-vladivostok-fleet/.env" "${BACKUP_PATH}/env.backup"
    echo "✅ Application environment file backed up."
fi

# 3. Export System Data via API Endpoint if available
if curl -s -f http://localhost:3000/api/v1/export-data > "${BACKUP_PATH}/app_state_export.json"; then
    echo "✅ Application JSON state exported successfully."
fi

# 4. Create final compressed tarball
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "jiv_fleet_backup_${TIMESTAMP}"
rm -rf "${BACKUP_PATH}"

echo "🎉 Backup complete! Archive created at: ${BACKUP_PATH}.tar.gz"
