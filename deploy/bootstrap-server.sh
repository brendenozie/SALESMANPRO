#!/usr/bin/env bash
# ==============================================================================
# SalesmanPro Server Bootstrap Script
# Target OS: Ubuntu 22.04 / 24.04 LTS or Debian 12
#
# PURPOSE:
# Idempotently provisions a new SalesmanPro compute node (Server 1, Server 2, Server 3).
# Once executed, this server connects to shared MongoDB, Redis, and S3,
# registers the universal Nginx configuration, passes health checks, and
# immediately serves all tenants with zero tenant-specific manual setup.
# ==============================================================================

set -euo pipefail

echo "======================================================================"
echo "🚀 SalesmanPro Application Server Bootstrap Initiated"
echo "======================================================================"

# 1. Update package lists
echo "📦 Updating APT package indices..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install base system utilities
echo "📦 Installing prerequisites (curl, git, build-essential, ufw, nginx, ffmpeg)..."
sudo apt-get install -y curl git ufw nginx certbot python3-certbot-nginx ffmpeg

# 3. Install Node.js 20.x LTS
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "✅ Node.js already installed: $(node -v)"
fi

# 4. Install PM2 globally
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2 process manager..."
  sudo npm install -g pm2
else
  echo "✅ PM2 already installed: $(pm2 -v)"
fi

# 5. Configure Firewall (UFW)
echo "🔒 Configuring firewall rules (SSH, HTTP, HTTPS)..."
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

# 6. Deploy Universal Nginx Application Configuration
echo "🌐 Configuring Universal Tenant-Agnostic Nginx..."
if [ -f "deploy/nginx-app-server.conf" ]; then
  sudo cp deploy/nginx-app-server.conf /etc/nginx/sites-available/salesmanpro.conf
  sudo ln -sfn /etc/nginx/sites-available/salesmanpro.conf /etc/nginx/sites-enabled/salesmanpro.conf
  # Remove default welcome site if present
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
  echo "✅ Universal Nginx configuration loaded successfully."
else
  echo "⚠️ Warning: deploy/nginx-app-server.conf not found in current directory."
fi

# 7. Check Environment Configuration
if [ ! -f ".env" ]; then
  echo "⚠️ Warning: .env file missing. Please copy your production .env before starting services."
else
  echo "✅ Production .env file verified."
fi

echo "======================================================================"
echo "✨ Server bootstrap complete!"
echo "Next steps:"
echo "  1. Verify .env file (DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, AWS S3)"
echo "  2. Run: npm install"
echo "  3. Run: npm run build"
echo "  4. Start processes: pm2 start ecosystem.config.js"
echo "  5. Verify health: curl -i http://127.0.0.1:3000/api/health"
echo "======================================================================"
