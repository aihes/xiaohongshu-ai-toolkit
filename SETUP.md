# 🚀 项目设置指南

## 📋 环境要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账户
- OpenRouter 账户（可选，用于AI分析）
- Sentry 账户（可选，用于错误监控）

## 🔧 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/redbook-cover-maker.git
cd redbook-cover-maker
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.template .env

# 编辑 .env 文件，填入你的配置
nano .env
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 🔑 环境变量配置

### Supabase 配置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 在 Settings > API 中获取以下信息：

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### OpenRouter API 配置（可选）

1. 访问 [OpenRouter](https://openrouter.ai)
2. 注册账户并获取 API 密钥
3. 配置环境变量：

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Sentry 配置（可选）

1. 访问 [Sentry Dashboard](https://sentry.io)
2. 创建新项目
3. 获取 DSN 和 Auth Token：

```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

### arXiv API 配置

如果你有自己的 arXiv 解析 API：

```bash
ARXIV_API_URL=your_arxiv_api_endpoint
```

## 🗄️ 数据库设置

### 1. 初始化 Supabase

```bash
# 安装 Supabase CLI
npm install -g @supabase/cli

# 登录 Supabase
supabase login

# 初始化项目
supabase init

# 链接到你的项目
supabase link --project-ref your-project-id
```

### 2. 运行数据库迁移

```bash
# 推送数据库架构
supabase db push

# 部署 Edge Functions
supabase functions deploy
```

### 3. 设置 RLS 策略

确保在 Supabase Dashboard 中启用 Row Level Security (RLS) 并配置适当的策略。

## 🚀 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署

### 手动部署

```bash
# 构建项目
npm run build

# 部署到你的服务器
# 将 dist/ 目录上传到你的 Web 服务器
```

## 🧪 测试

```bash
# 运行测试
npm run test

# 运行 E2E 测试
npm run test:e2e
```

## 📚 功能说明

### 核心功能

- **封面生成**: 使用 AI 生成小红书风格的封面
- **论文分析**: 解析 arXiv 论文并生成小红书风格总结
- **积分系统**: 用户积分管理和消费记录
- **用户认证**: 基于 Supabase Auth 的用户系统

### 可选功能

- **错误监控**: 使用 Sentry 进行错误追踪
- **AI 分析**: 使用 OpenRouter 进行高质量论文分析

## 🔧 开发指南

### 项目结构

```
src/
├── components/          # React 组件
├── pages/              # 页面组件
├── lib/                # 工具库
├── integrations/       # 第三方集成
└── types/              # TypeScript 类型定义

supabase/
├── functions/          # Edge Functions
├── migrations/         # 数据库迁移
└── config.toml         # Supabase 配置
```

### 添加新功能

1. 在 `src/components/` 中创建组件
2. 在 `src/pages/` 中创建页面
3. 更新路由配置
4. 添加必要的数据库表和 RLS 策略

### Edge Functions

```bash
# 创建新的 Edge Function
supabase functions new function-name

# 本地测试
supabase functions serve

# 部署
supabase functions deploy function-name
```

## 🐛 故障排除

### 常见问题

1. **Supabase 连接失败**
   - 检查 URL 和 API 密钥是否正确
   - 确认项目 ID 匹配

2. **Edge Functions 部署失败**
   - 检查 Supabase CLI 是否最新版本
   - 确认已正确链接项目

3. **环境变量未生效**
   - 重启开发服务器
   - 检查 .env 文件格式

### 调试技巧

```bash
# 查看 Supabase 日志
supabase functions logs function-name

# 查看本地开发日志
npm run dev -- --debug
```

## 📞 支持

如果遇到问题：

1. 查看 [Issues](https://github.com/your-username/redbook-cover-maker/issues)
2. 创建新的 Issue
3. 查看项目文档

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。
