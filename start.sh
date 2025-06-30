#!/bin/bash

# AI Conversation Management System 启动脚本

echo "🚀 启动 AI Conversation Management System..."

# 检查是否在正确的目录
if [ ! -f "frontend-1/package.json" ] || [ ! -f "backend/app/main.py" ]; then
    echo "❌ 错误: 请在 ai-ui 目录下运行此脚本"
    exit 1
fi

# 创建环境变量文件（如果不存在）
if [ ! -f "frontend-1/.env" ]; then
    echo "📝 创建环境变量文件..."
    cp frontend-1/env.example frontend-1/.env
    echo "✅ 环境变量文件已创建，请根据需要修改 VITE_API_BASE_URL"
fi

# 检查后端依赖
echo "🔍 检查后端依赖..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

echo "📦 激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy

# 启动后端服务
echo "🔧 启动后端服务 (端口 8001)..."
python -m uvicorn app.main:app --reload --port 8001 --host 0.0.0.0 &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8001/docs > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务
echo "🎨 启动前端服务..."
cd ../frontend-1

# 检查前端依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

echo "🚀 启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

# 等待前端启动
echo "⏳ 等待前端服务启动..."
sleep 5

# 显示服务信息
echo ""
echo "🎉 AI Conversation Management System 启动完成!"
echo ""
echo "📱 前端服务: http://localhost:5173"
echo "🔧 后端服务: http://localhost:8001"
echo "📚 API文档: http://localhost:8001/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait 