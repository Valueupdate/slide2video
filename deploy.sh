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
ssh root@${VPS_HOST:-133.88.121.90} "cd /opt/slide2video && git pull && cd frontend && npm run build && sudo systemctl restart slide2video && echo '✅ Deploy complete!'"
