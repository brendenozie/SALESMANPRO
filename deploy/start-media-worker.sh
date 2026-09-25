#!/usr/bin/env bash
# ==============================================================================
# SalesmanPro - Automated Media Transcode Worker Orchestrator
# Path: deploy/start-media-worker.sh
#
# PURPOSE:
# Automatically detects the runtime environment on any server node:
# 1. If Docker is available: Launches the isolated containerized FFmpeg worker
#    with hard cgroup CPU (2.0) and RAM (2048M) limits via Docker Compose.
# 2. If Docker is UNAVAILABLE: Automatically provisions bare-metal dependencies
#    (detects and installs FFmpeg via system package manager if missing),
#    compiles worker assets, and commences execution under PM2 with memory caps.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

DOCKER_COMPOSE_FILE="${ROOT_DIR}/docker-compose.media-worker.yml"
ECOSYSTEM_FILE="${ROOT_DIR}/ecosystem.config.js"
FORCE_PM2="${FORCE_PM2:-false}"

echo "======================================================================"
echo "🎬 SalesmanPro Media Transcode Worker Commencement"
echo "   Node: $(hostname)"
echo "   Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "======================================================================"

# Function: Auto-install FFmpeg on host OS if missing
install_host_ffmpeg() {
  echo "🔍 Checking for host FFmpeg installation..."
  if command -v ffmpeg &>/dev/null && command -v ffprobe &>/dev/null; then
    echo "✅ FFmpeg is already installed on host: $(ffmpeg -version 2>&1 | head -n 1)"
    return 0
  fi

  echo "⚠️ FFmpeg not found on host. Attempting automatic installation..."
  if [ -f /etc/debian_version ] || command -v apt-get &>/dev/null; then
    echo "📦 Detected Debian/Ubuntu. Installing FFmpeg via apt..."
    sudo apt-get update -y && sudo apt-get install -y ffmpeg
  elif [ -f /etc/redhat-release ] || command -v dnf &>/dev/null; then
    echo "📦 Detected RHEL/CentOS/Fedora. Installing FFmpeg via dnf..."
    sudo dnf install -y epel-release || true
    sudo dnf install -y ffmpeg
  elif command -v yum &>/dev/null; then
    echo "📦 Detected CentOS/Amazon Linux. Installing FFmpeg via yum..."
    sudo yum install -y ffmpeg
  elif command -v apk &>/dev/null; then
    echo "📦 Detected Alpine Linux. Installing FFmpeg via apk..."
    sudo apk add --no-cache ffmpeg
  elif command -v brew &>/dev/null; then
    echo "📦 Detected Homebrew. Installing FFmpeg via brew..."
    brew install ffmpeg
  else
    echo "❌ Error: Could not determine package manager to install FFmpeg automatically."
    echo "Please install FFmpeg manually: 'sudo apt-get install -y ffmpeg' or start Docker."
    exit 1
  fi

  if command -v ffmpeg &>/dev/null; then
    echo "✅ FFmpeg successfully installed: $(ffmpeg -version 2>&1 | head -n 1)"
  else
    echo "❌ Error: FFmpeg installation verification failed."
    exit 1
  fi
}

# Function: Run worker via Docker Compose
run_via_docker() {
  echo "🐳 Docker daemon detected. Commencing containerized worker execution..."

  local COMPOSE_CMD=""
  if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
  elif command -v docker-compose &>/dev/null; then
    COMPOSE_CMD="docker-compose"
  else
    echo "⚠️ Docker is installed, but neither 'docker compose' nor 'docker-compose' was found."
    return 1
  fi

  echo "📦 Building and starting container via: ${COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} up -d"
  ${COMPOSE_CMD} -f "${DOCKER_COMPOSE_FILE}" up -d --build --remove-orphans

  echo "🩺 Checking container status..."
  sleep 3
  docker ps --filter "name=salesmanpro-video-transcoder" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

  echo "✅ Dockerized video transcode worker is actively running in background."
  echo "📋 To inspect logs: docker logs -f salesmanpro-video-transcoder"
  return 0
}

# Function: Run worker via PM2 bare-metal fallback
run_via_pm2() {
  echo "⚙️ Initializing Bare-Metal Worker execution via PM2..."

  # 1. Ensure FFmpeg is available
  install_host_ffmpeg

  # 2. Ensure PM2 is installed
  if ! command -v pm2 &>/dev/null; then
    echo "📦 PM2 not found. Installing PM2 globally..."
    sudo npm install -g pm2
  fi

  # 3. Ensure worker code is compiled to dist-worker
  if [ ! -f "${ROOT_DIR}/dist-worker/workers/video-transcode-runner.js" ]; then
    echo "🔨 Worker build artifact missing. Compiling with tsconfig.worker.json..."
    npx tsc --project tsconfig.worker.json
  fi

  # 4. Start or reload under PM2
  echo "🚀 Commencing video-transcode-worker in PM2..."
  pm2 startOrReload "${ECOSYSTEM_FILE}" --only video-transcode-worker --update-env

  # 5. Save PM2 process list
  pm2 save

  echo "🩺 Current PM2 worker status:"
  pm2 status video-transcode-worker

  echo "✅ Bare-metal video transcode worker is actively managed by PM2."
  echo "📋 To inspect logs: pm2 logs video-transcode-worker"
  return 0
}

# ==============================================================================
# Execution Flow
# ==============================================================================

# Check if Docker is available and operational
DOCKER_AVAILABLE=false
if [ "${FORCE_PM2}" != "true" ] && command -v docker &>/dev/null; then
  if docker info &>/dev/null; then
    DOCKER_AVAILABLE=true
  else
    echo "⚠️ 'docker' binary found, but Docker daemon is not running or accessible."
  fi
fi

if [ "${DOCKER_AVAILABLE}" = "true" ]; then
  if ! run_via_docker; then
    echo "⚠️ Docker startup encountered an issue. Falling back to Bare-Metal PM2..."
    run_via_pm2
  fi
else
  if [ "${FORCE_PM2}" = "true" ]; then
    echo "ℹ️ FORCE_PM2=true flag specified. Bypassing Docker."
  else
    echo "ℹ️ Docker unavailable on this host."
  fi
  run_via_pm2
fi

echo "======================================================================"
echo "🎉 Transcode worker commencement successfully completed!"
echo "======================================================================"
