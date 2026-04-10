#!/bin/bash
# 前端本地开发环境初始化脚本
# 功能：检查并初始化 .env.development 配置文件
# 用法：./scripts/init-local-env.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件
TEMPLATE_FILE=".env.development.example"
TARGET_FILE=".env.development"
BACKUP_FILE=".env.development.backup"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  前端本地开发环境配置初始化工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "模板文件: ${YELLOW}${TEMPLATE_FILE}${NC}"
echo -e "目标文件: ${YELLOW}${TARGET_FILE}${NC}"
echo

# 检查模板文件是否存在
if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo -e "${RED}错误：模板文件 ${TEMPLATE_FILE} 不存在${NC}"
    echo "请确保项目根目录中存在模板文件。"
    echo "如果不存在，请从版本控制中获取或联系项目维护者。"
    exit 1
fi

# 检查目标文件是否存在
if [[ -f "$TARGET_FILE" ]]; then
    echo -e "${YELLOW}警告：目标文件 ${TARGET_FILE} 已存在${NC}"
    echo "选择操作："
    echo "  1) 备份现有文件并创建新配置"
    echo "  2) 保留现有文件，退出脚本"
    echo "  3) 查看现有文件内容"
    read -p "请输入选择 (1/2/3): " choice
    
    case $choice in
        1)
            timestamp=$(date +%Y%m%d_%H%M%S)
            backup_name="${TARGET_FILE}.backup.${timestamp}"
            cp "$TARGET_FILE" "$backup_name"
            echo -e "${GREEN}已备份现有文件到: ${backup_name}${NC}"
            ;;
        2)
            echo -e "${GREEN}保留现有文件，退出脚本。${NC}"
            exit 0
            ;;
        3)
            echo -e "${BLUE}=== 现有文件内容 ===${NC}"
            cat "$TARGET_FILE"
            echo -e "${BLUE}====================${NC}"
            echo
            read -p "是否继续覆盖？(y/N): " overwrite
            if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
                echo -e "${GREEN}取消操作，退出脚本。${NC}"
                exit 0
            fi
            ;;
        *)
            echo -e "${RED}无效选择，退出脚本。${NC}"
            exit 1
            ;;
    esac
fi

# 复制模板文件
cp "$TEMPLATE_FILE" "$TARGET_FILE"
echo -e "${GREEN}已创建配置文件: ${TARGET_FILE}${NC}"
echo

# 显示配置说明
echo -e "${BLUE}=== 前端配置说明 ===${NC}"
echo "以下配置项需要根据您的开发环境调整："
echo
echo "1. API 端点配置："
echo "   NEXT_PUBLIC_API_URL=http://localhost:3001/v1"
echo "   - 本地开发：使用 http://localhost:3001/v1"
echo "   - Docker Compose：使用 http://booking-backend:3001/v1"
echo "   - 生产环境：使用实际的 API 域名"
echo
echo "2. WebSocket 配置："
echo "   NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws"
echo "   - 本地开发：使用 ws://localhost:3001/ws"
echo "   - Docker Compose：使用 ws://booking-backend:3001/ws"
echo "   - 生产环境：使用 wss:// 协议和实际域名"
echo
echo "3. 实例标识："
echo "   NEXT_PUBLIC_INSTANCE_NAME=dev"
echo "   - 本地开发建议使用 \"dev\" 或 \"local\""
echo "   - 历史遗留：之前使用 instance1, instance2, instance3"
echo
echo -e "${BLUE}=====================${NC}"
echo

# 提供快速编辑命令提示
echo -e "${YELLOW}快速编辑命令：${NC}"
if command -v code &> /dev/null; then
    echo "  code $TARGET_FILE"
elif command -v nano &> /dev/null; then
    echo "  nano $TARGET_FILE"
elif command -v vim &> /dev/null; then
    echo "  vim $TARGET_FILE"
else
    echo "  请使用文本编辑器打开: $TARGET_FILE"
fi
echo

# 环境选择提示
echo -e "${BLUE}=== 环境配置建议 ===${NC}"
echo "根据您的开发环境，建议使用以下配置："
echo
echo "A) 纯本地开发（后端和前端都直接在本地运行）："
echo "   NEXT_PUBLIC_API_URL=http://localhost:3001/v1"
echo "   NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws"
echo "   NEXT_PUBLIC_INSTANCE_NAME=dev"
echo
echo "B) Docker Compose 开发（使用 docker-compose up）："
echo "   NEXT_PUBLIC_API_URL=http://booking-backend:3001/v1"
echo "   NEXT_PUBLIC_WS_URL=ws://booking-backend:3001/ws"
echo "   NEXT_PUBLIC_INSTANCE_NAME=dev"
echo
echo "C) 混合模式（前端本地，后端 Docker）："
echo "   NEXT_PUBLIC_API_URL=http://localhost:3001/v1（端口映射后）"
echo "   NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws"
echo "   NEXT_PUBLIC_INSTANCE_NAME=dev"
echo
echo -e "${BLUE}=====================${NC}"
echo

# 验证文件语法（简单检查）
echo -e "${BLUE}=== 配置验证 ===${NC}"
if grep -q "your-.*here" "$TARGET_FILE"; then
    echo -e "${YELLOW}警告：配置文件中仍存在占位符，请务必修改。${NC}"
    grep "your-.*here" "$TARGET_FILE"
else
    echo -e "${GREEN}未检测到明显占位符。${NC}"
fi

# 检查必要的配置项
required_vars=("NEXT_PUBLIC_API_URL" "NEXT_PUBLIC_WS_URL" "NEXT_PUBLIC_INSTANCE_NAME")
missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" "$TARGET_FILE"; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    echo -e "${YELLOW}注意：以下配置项未找到，请确认是否需要：${NC}"
    printf '%s\n' "${missing_vars[@]}"
fi

echo
echo -e "${GREEN}=== 初始化完成 ===${NC}"
echo "配置文件已创建：$TARGET_FILE"
echo "请根据上述说明调整配置，然后启动前端应用。"
echo "启动命令：npm run dev"
echo
echo -e "${BLUE}如需帮助，请参考：${NC}"
echo "1. README.md 中的前端配置说明"
echo "2. 模板文件中的注释说明"
echo "3. 后端配置文档（如果需要对接后端）"
echo

# 提供环境验证命令
echo -e "${YELLOW}环境验证命令：${NC}"
echo "  # 检查配置是否生效"
echo "  npm run dev"
echo "  # 运行测试"
echo "  npm test"
echo "  # 构建检查"
echo "  npm run build"