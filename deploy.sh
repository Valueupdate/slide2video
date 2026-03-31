#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "📦 Pushing to GitHub..."
git add -A
git commit -m "${1:-deploy}"
git push

echo "🚀 Deploying to VPS..."
if [ -z "$VPS_HOST" ]; then
  echo "❌ Error: VPS_HOST environment variable is not set."
  echo "   Run: export VPS_HOST=<your-vps-ip>"
  exit 1
fi
ssh root@${VPS_HOST} "cd /opt/slide2video && git pull && cd frontend && npm run build && sudo systemctl restart slide2video && echo '✅ Deploy complete!'"
