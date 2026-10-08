#!/bin/bash
cd ~/ColorLink
git pull origin main
pnpm install
pnpm run build
pm2 restart colorlink
echo "✅ Deploy completo"
