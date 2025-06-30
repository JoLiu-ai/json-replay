#!/bin/bash

# 启动后端服务器在端口8001
echo "Starting backend server on port 8001..."
python -m uvicorn app.main:app --reload --port 8001 --host 0.0.0.0 