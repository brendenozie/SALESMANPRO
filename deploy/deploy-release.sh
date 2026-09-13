#!/usr/bin/env bash
# ==============================================================================
# SalesmanPro Zero-Downtime Atomic Release & Rollback Script
# Path: deploy/deploy-release.sh
#
# PURPOSE:
# Deploys a pre-compiled, verified Next.js standalone artifact with zero build
# work on the production server. Executes atomic symlink switching, process
# reload, health-check verification, and automated rollback upon failure.
# ==============================================================================

set -euo pipefail

BASE_DIR="/var/www/salesmanpro"
RELEASES_DIR="${BASE_DIR}/releases"
ARCHIVES_DIR="${RELEASES_DIR}/archives"
SHARED_DIR="${BASE_DIR}/shared"
CURRENT_LINK="${BASE_DIR}/current"
KEEP_RELEASES=5

RELEASE_ID="${1:-}"
if [ -z "${RELEASE_ID}" ]; then
  echo "❌ Error: RELEASE_ID argument missing. Usage: ./deploy-release.sh <release_id>"
  exit 1
fi

ARCHIVE_FILE="${ARCHIVES_DIR}/release-${RELEASE_ID}.tar.gz"
TARGET_DIR="${RELEASES_DIR}/${RELEASE_ID}"

echo "======================================================================"
echo "🚀 Initiating Atomic Release Deployment: ${RELEASE_ID}"
echo "======================================================================"

# 1. Ensure directory hierarchy exists
mkdir -p "${RELEASES_DIR}" "${ARCHIVES_DIR}" "${SHARED_DIR}" "${SHARED_DIR}/uploads"

# 2. Migrate legacy in-place configuration if shared/.env does not exist yet
if [ ! -f "${SHARED_DIR}/.env" ]; then
  for candidate in "${BASE_DIR}/.env" "${BASE_DIR}/current/.env" "${BASE_DIR}/.env.production"; do
    if [ -f "${candidate}" ] && [ ! -L "${candidate}" ]; then
      echo "📋 Migrating existing production .env from ${candidate} to ${SHARED_DIR}/.env..."
      cp "${candidate}" "${SHARED_DIR}/.env"
      break
    fi
  done
fi

# 3. Verify release archive exists
if [ ! -f "${ARCHIVE_FILE}" ]; then
  echo "❌ Error: Archive file not found at ${ARCHIVE_FILE}"
  exit 1
fi

# 4. Extract release artifact into isolated directory
echo "📦 Extracting release artifact to ${TARGET_DIR}..."
rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
tar -xzf "${ARCHIVE_FILE}" -C "${TARGET_DIR}"

# 5. Link shared persistent assets (.env and uploads)
echo "🔗 Linking persistent shared resources..."
if [ -f "${SHARED_DIR}/.env" ]; then
  ln -sfn "${SHARED_DIR}/.env" "${TARGET_DIR}/.env"
  echo "✅ Linked ${SHARED_DIR}/.env -> ${TARGET_DIR}/.env"
else
  echo "⚠️ Warning: No ${SHARED_DIR}/.env found. Ensure environment variables are configured."
fi

mkdir -p "${TARGET_DIR}/public"
ln -sfn "${SHARED_DIR}/uploads" "${TARGET_DIR}/public/uploads"

# 6. Capture previous release target for instant rollback capability
PREVIOUS_RELEASE=""
if [ -L "${CURRENT_LINK}" ]; then
  PREVIOUS_RELEASE="$(readlink -f "${CURRENT_LINK}" || true)"
fi

# 7. Atomic Symlink Switch
echo "🔄 Atomically switching active release symlink..."
ln -sfn "${TARGET_DIR}" "${BASE_DIR}/current_tmp"
mv -Tf "${BASE_DIR}/current_tmp" "${CURRENT_LINK}"

# 8. Reload PM2 with zero downtime
echo "🔁 Reloading PM2 processes..."
cd "${CURRENT_LINK}"
export NODE_ENV="production"

# If salesmanpro is currently running in fork mode, delete it once so it cleanly transitions to cluster mode
if pm2 describe salesmanpro 2>/dev/null | grep -qi "fork_mode"; then
  echo "🔄 Migrating salesmanpro from fork mode to zero-downtime cluster mode..."
  pm2 delete salesmanpro || true
fi

# Clean up duplicate PM2 instances for single-instance background worker processes
for app_name in ssl-worker whatsapp-worker ai-job-worker backup-worker ai-workforce-worker; do
  COUNT=$(pm2 jlist 2>/dev/null | grep -o "\"name\":\"${app_name}\"" | wc -l || echo "0")
  if [ "${COUNT}" -gt 1 ]; then
    echo "⚠️ Detected ${COUNT} duplicate instances for ${app_name}, resetting..."
    pm2 delete "${app_name}" || true
  fi
done

# Perform zero-downtime rolling reload for cluster mode, falling back to startOrReload if not already running
pm2 reload ecosystem.config.js --update-env || pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# 9. Automated Health Check Verification
echo "🩺 Verifying application health..."
HEALTH_URL="http://127.0.0.1:3000/api/health?type=liveness"
MAX_RETRIES=12
RETRY_DELAY=3
HEALTH_PASSED=false

for i in $(seq 1 ${MAX_RETRIES}); do
  echo "Probe ${i}/${MAX_RETRIES} -> ${HEALTH_URL}"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" || echo "000")

  if [ "${HTTP_STATUS}" -eq 200 ]; then
    HEALTH_PASSED=true
    echo "✅ Health check PASSED (HTTP 200 OK)."
    break
  fi

  RESPONSE_BODY=$(curl -s "${HEALTH_URL}" 2>/dev/null | head -c 200 || echo "")
  echo "⏳ Status: ${HTTP_STATUS}. Response: ${RESPONSE_BODY}. Waiting ${RETRY_DELAY}s before next probe..."
  sleep ${RETRY_DELAY}
done

# 10. Rollback if health check failed
if [ "${HEALTH_PASSED}" != "true" ]; then
  echo "🚨 CRITICAL: Health check FAILED after ${MAX_RETRIES} attempts!"
  echo "📋 Diagnostics: Dumping salesmanpro application logs..."
  pm2 logs salesmanpro --lines 40 --nostream || true
  echo "📋 Diagnostics: Dumping general PM2 logs..."
  pm2 logs --lines 40 --nostream || true

  if [ -n "${PREVIOUS_RELEASE}" ] && [ -d "${PREVIOUS_RELEASE}" ]; then
    echo "⏪ Executing INSTANT ROLLBACK to previous release: ${PREVIOUS_RELEASE}..."
    ln -sfn "${PREVIOUS_RELEASE}" "${BASE_DIR}/current_tmp"
    mv -Tf "${BASE_DIR}/current_tmp" "${CURRENT_LINK}"
    cd "${CURRENT_LINK}"
    pm2 startOrReload ecosystem.config.js --update-env || pm2 restart ecosystem.config.js --update-env
    pm2 save
    echo "✅ Rollback completed. Live service restored to previous release."
  else
    echo "⚠️ Warning: No previous release found to roll back to."
  fi

  exit 1
fi

# 11. Release Cleanup (keep last N releases)
echo "🧹 Pruning old releases (retaining last ${KEEP_RELEASES})..."
cd "${RELEASES_DIR}"
ls -dt */ 2>/dev/null | grep -v "archives" | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

echo "🎉 Release ${RELEASE_ID} deployed and verified successfully!"
