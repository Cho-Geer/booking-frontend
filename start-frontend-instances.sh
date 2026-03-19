#!/bin/bash

# 前端多实例启动脚本
# 使用方法：./start-frontend-instances.sh

echo "🚀 启动前端多实例..."

# 创建日志目录
mkdir -p logs

# 启动实例 1 (端口 3000)
echo "📦 启动前端实例 1 (端口 3000)..."
cp .env.instance1 .env
PORT=3000 nohup npm run dev > logs/frontend-instance1.log 2>&1 &
INSTANCE1_PID=$!
echo "✅ 前端实例 1 已启动 (PID: $INSTANCE1_PID)"

# 等待实例 1 启动
sleep 3

# 启动实例 2 (端口 3002)
echo "📦 启动前端实例 2 (端口 3002)..."
cp .env.instance2 .env
PORT=3002 nohup npm run dev > logs/frontend-instance2.log 2>&1 &
INSTANCE2_PID=$!
echo "✅ 前端实例 2 已启动 (PID: $INSTANCE2_PID)"

# 等待实例 2 启动
sleep 3

# 启动实例 3 (端口 3003)
echo "📦 启动前端实例 3 (端口 3003)..."
cp .env.instance3 .env
PORT=3003 nohup npm run dev > logs/frontend-instance3.log 2>&1 &
INSTANCE3_PID=$!
echo "✅ 前端实例 3 已启动 (PID: $INSTANCE3_PID)"

echo ""
echo "🎉 所有前端实例已启动!"
echo "📊 实例 1: http://localhost:3000 (PID: $INSTANCE1_PID)"
echo "📊 实例 2: http://localhost:3002 (PID: $INSTANCE2_PID)"
echo "📊 实例 3: http://localhost:3003 (PID: $INSTANCE3_PID)"
echo ""
echo "📝 查看日志：tail -f logs/frontend-instance1.log"
echo "🛑 停止所有实例：./stop-frontend-instances.sh"

# 保存 PID 到文件
echo $INSTANCE1_PID > logs/frontend-instance1.pid
echo $INSTANCE2_PID > logs/frontend-instance2.pid
echo $INSTANCE3_PID > logs/frontend-instance3.pid
