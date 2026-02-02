#!/bin/bash

echo "🚀 System Diagram Applicationを起動しています..."
echo ""

# Docker Composeで起動
docker-compose up --build

echo ""
echo "✅ アプリケーションが起動しました！"
echo "📱 フロントエンド: http://localhost:3000"
echo "🔌 バックエンドAPI: http://localhost:3001"
echo ""
echo "停止するには Ctrl+C を押してください"
