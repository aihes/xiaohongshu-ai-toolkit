#!/bin/bash

# 小红书封面生成器部署脚本
# 使用方法: ./deploy.sh [platform]
# 平台选项: vercel, netlify, docker, build

set -e

echo "🚀 小红书封面生成器部署脚本"
echo "================================"

# 检查参数
PLATFORM=${1:-"build"}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_step "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js 版本过低，需要 16+，当前版本: $(node -v)"
        exit 1
    fi
    
    print_message "依赖检查通过 ✓"
}

# 安装依赖
install_dependencies() {
    print_step "安装依赖..."
    npm ci
    print_message "依赖安装完成 ✓"
}

# 构建项目
build_project() {
    print_step "构建项目..."
    
    # 检查环境变量
    if [ ! -f ".env.production" ] && [ ! -f ".env" ]; then
        print_warning "未找到环境变量文件，使用默认配置"
    fi
    
    npm run build
    print_message "项目构建完成 ✓"
}

# Vercel 部署
deploy_vercel() {
    print_step "部署到 Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_message "安装 Vercel CLI..."
        npm install -g vercel
    fi
    
    print_message "开始部署到 Vercel..."
    vercel --prod
    print_message "Vercel 部署完成 ✓"
}

# Netlify 部署
deploy_netlify() {
    print_step "部署到 Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_message "安装 Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    build_project
    
    print_message "开始部署到 Netlify..."
    netlify deploy --prod --dir=dist
    print_message "Netlify 部署完成 ✓"
}

# Docker 部署
deploy_docker() {
    print_step "Docker 部署..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    print_message "构建 Docker 镜像..."
    docker build -t redbook-cover-maker .
    
    print_message "停止现有容器..."
    docker stop redbook-app 2>/dev/null || true
    docker rm redbook-app 2>/dev/null || true
    
    print_message "启动新容器..."
    docker run -d -p 80:8080 --name redbook-app redbook-cover-maker
    
    print_message "Docker 部署完成 ✓"
    print_message "应用访问地址: http://localhost"
}

# 检查部署状态
check_deployment() {
    print_step "检查部署状态..."
    
    if [ "$PLATFORM" = "docker" ]; then
        if docker ps | grep -q redbook-app; then
            print_message "Docker 容器运行正常 ✓"
        else
            print_error "Docker 容器未运行"
            exit 1
        fi
    fi
}

# 主函数
main() {
    echo "平台: $PLATFORM"
    echo ""
    
    check_dependencies
    
    case $PLATFORM in
        "vercel")
            install_dependencies
            deploy_vercel
            ;;
        "netlify")
            install_dependencies
            deploy_netlify
            ;;
        "docker")
            deploy_docker
            ;;
        "build")
            install_dependencies
            build_project
            print_message "构建完成，文件位于 dist/ 目录"
            ;;
        *)
            print_error "未知平台: $PLATFORM"
            echo "支持的平台: vercel, netlify, docker, build"
            exit 1
            ;;
    esac
    
    check_deployment
    
    echo ""
    print_message "🎉 部署完成！"
    
    # 显示后续步骤
    echo ""
    echo "📋 后续步骤:"
    echo "1. 检查网站是否正常访问"
    echo "2. 测试用户注册/登录功能"
    echo "3. 验证 Sentry 错误监控"
    echo "4. 配置自定义域名（如需要）"
    echo ""
    echo "📚 更多信息请查看 DEPLOYMENT_GUIDE.md"
}

# 运行主函数
main
