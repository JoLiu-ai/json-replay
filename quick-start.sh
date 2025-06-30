#!/bin/bash

echo "🚀 快速启动 AI Conversation Management System"

# 启动后端
echo "🔧 启动后端服务 (端口 8001)..."
cd backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install fastapi uvicorn sqlalchemy > /dev/null 2>&1
python -m uvicorn app.main:app --reload --port 8001 &
BACKEND_PID=$!

# 启动前端
echo "🎨 启动前端服务..."
cd ../frontend-1
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo "✅ 服务启动完成!"
echo "📱 前端: http://localhost:5173"
echo "🔧 后端: http://localhost:8001"
echo "按 Ctrl+C 停止"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 