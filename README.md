# 🎨 小红书封面生成器

一个基于 AI 的小红书风格封面生成器和论文分析工具，支持自动生成吸引人的封面设计和将学术论文转化为小红书风格的内容。

## ✨ 功能特色

### 🎯 核心功能
- **AI 封面生成**: 使用先进的 AI 技术生成小红书风格的封面
- **论文智能分析**: 解析 arXiv 论文并生成小红书风格的内容总结
- **积分系统**: 完整的用户积分管理和消费记录
- **用户认证**: 基于 Supabase 的安全用户认证系统

### 🔧 技术特性
- **实时 PDF 解析**: 支持完整的 PDF 文本和图片提取
- **AI 内容生成**: 集成 OpenRouter Claude 3.5 Sonnet 进行高质量分析
- **错误监控**: 使用 Sentry 进行实时错误追踪
- **响应式设计**: 完美适配桌面和移动设备

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 账户
- OpenRouter 账户（可选）

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-username/redbook-cover-maker.git
cd redbook-cover-maker

# 2. 安装依赖
npm install

# 3. 环境配置
cp .env.template .env
# 编辑 .env 文件，填入你的配置

# 4. 启动开发服务器
npm run dev
```

## 🔑 环境配置

### 必需配置

```bash
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 可选配置

```bash
# OpenRouter API (用于 AI 分析)
OPENROUTER_API_KEY=your_openrouter_api_key

# Sentry (错误监控)
VITE_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here

# 自定义 arXiv API
ARXIV_API_URL=your_arxiv_api_endpoint
```

详细配置说明请参考 [SETUP.md](./SETUP.md)

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化的用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量的 UI 组件库

### 后端技术栈
- **Supabase** - 开源的 Firebase 替代方案
- **Edge Functions** - 无服务器函数
- **PostgreSQL** - 关系型数据库
- **Row Level Security** - 数据安全保护

### AI 集成
- **OpenRouter** - AI 模型 API 网关
- **Claude 3.5 Sonnet** - 高质量的文本分析
- **自定义 PDF 解析** - 完整的论文内容提取

## 📊 项目结构

```
src/
├── components/          # React 组件
│   ├── ui/             # 基础 UI 组件
│   └── ...             # 业务组件
├── pages/              # 页面组件
├── lib/                # 工具库和配置
├── integrations/       # 第三方服务集成
└── types/              # TypeScript 类型定义

supabase/
├── functions/          # Edge Functions
│   ├── analyze-paper/  # 论文分析功能
│   └── ...             # 其他函数
├── migrations/         # 数据库迁移文件
└── config.toml         # Supabase 配置
```

## 🎯 使用指南

### 封面生成
1. 输入封面主题或关键词
2. 选择风格和模板
3. AI 自动生成多个设计方案
4. 下载高质量封面图片

### 论文分析
1. 输入 arXiv 论文链接
2. 选择分析类型（总结/图片/完整分析）
3. AI 自动解析并生成小红书风格内容
4. 一键复制或分享内容

## 🚀 部署指南

### Vercel 部署（推荐）
1. Fork 本项目到你的 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

### 手动部署
```bash
# 构建项目
npm run build

# 部署 dist/ 目录到你的服务器
```

### Supabase 设置
```bash
# 安装 Supabase CLI
npm install -g @supabase/cli

# 登录并链接项目
supabase login
supabase link --project-ref your-project-id

# 推送数据库架构
supabase db push

# 部署 Edge Functions
supabase functions deploy
```

## 🧪 开发指南

### 本地开发
```bash
# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

### 添加新功能
1. 在 `src/components/` 创建组件
2. 在 `src/pages/` 创建页面
3. 更新路由和类型定义
4. 添加必要的数据库表和 RLS 策略

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 添加适当的测试覆盖

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- [Supabase](https://supabase.com) - 提供后端服务
- [OpenRouter](https://openrouter.ai) - AI 模型 API
- [shadcn/ui](https://ui.shadcn.com) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架

## 📞 支持

如果你遇到问题或有建议：

- 📧 Email: your-email@example.com
- 🐛 [Issues](https://github.com/your-username/redbook-cover-maker/issues)
- 💬 [Discussions](https://github.com/your-username/redbook-cover-maker/discussions)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
