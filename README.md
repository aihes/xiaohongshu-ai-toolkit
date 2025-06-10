# 🎨 小红书封面生成器

一个基于 AI 的小红书风格封面生成器和论文分析工具，支持自动生成吸引人的封面设计和将学术论文转化为小红书风格的内容。

> 🚀 **特别推荐**: 查看我们的 [AI产品开发完整指南](./AI-Product-Development-Guide.md)，了解如何从想法到落地，打造自己的AI产品！

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
git clone https://github.com/aihes/xiaohongshu-ai-toolkit.git
cd xiaohongshu-ai-toolkit

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

## 📚 AI产品开发指南

本项目不仅是一个完整的AI应用，更是一个学习AI产品开发的实战案例。我们提供了详细的开发指南：

### 🎯 [AI产品开发完整指南](./AI-Product-Development-Guide.md)

这份指南涵盖了从想法到产品落地的完整流程：

#### 🌟 核心内容

**第一部分：从想法萌芽到行动准备**
- 💡 **灵感来源**: 如何发现和验证产品想法
- 🧠 **破除心理障碍**: 从"我不会"到"我可以学"
- 🛠️ **工具军火库**: 完整的AI开发工具链推荐

**第二部分：从原型到产品**
- ⚡ **快速原型**: 使用DeepSeek、Lovable等工具快速搭建
- 🌐 **产品运维**: 域名、CDN、监控等基础设施
- 📈 **营销推广**: KOL合作、内容营销等实战经验
- ❓ **操作FAQ**: Google/GitHub OAuth、支付集成等常见问题

**第三部分：从个人项目到商业可能**
- 👥 **团队组建**: 如何寻找技术/运营合伙人
- 🏢 **孵化器**: Y Combinator等知名孵化器申请指南
- 💰 **融资路径**: 如何接触投资人和准备路演

#### 🎁 实战案例

指南以本项目为例，展示了：
- 如何用AI工具快速开发产品原型
- 完整的技术栈选择和集成
- 从0到1的产品发布流程
- 真实的用户反馈和迭代经验

> 💡 **适合人群**: 产品经理、开发者、创业者，以及所有想要将AI想法变为现实的"筑梦师"

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
├── src/                           # 前端源码
│   ├── components/                # React 组件
│   ├── pages/                     # 页面组件
│   ├── lib/                       # 工具库和配置
│   └── integrations/              # 第三方服务集成
├── supabase/                      # 后端服务
│   ├── functions/                 # Edge Functions
│   └── migrations/                # 数据库迁移文件
├── images/                        # 文档图片资源
├── AI-Product-Development-Guide.md # 🌟 AI产品开发完整指南
├── download_images.py             # 图片处理脚本
└── process_markdown_images.py     # 通用图片处理脚本
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

## 🎓 学习资源

### 📖 推荐阅读

如果你对AI产品开发感兴趣，强烈推荐阅读我们的：

**[🚀 AI产品开发完整指南](./AI-Product-Development-Guide.md)**

这份指南基于本项目的实际开发经验，详细记录了：
- 从想法验证到产品上线的完整流程
- 45个实战截图和操作步骤
- 工具选择、技术集成、运营推广的第一手经验
- 创业路径和融资建议

> 💡 这不仅是一个技术教程，更是一个"筑梦师"的实战手册

## 🙏 致谢

- [Supabase](https://supabase.com) - 提供后端服务
- [OpenRouter](https://openrouter.ai) - AI 模型 API
- [shadcn/ui](https://ui.shadcn.com) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架

## 📞 支持

如果你遇到问题或有建议：

- 📧 Email: aihehe123@gmail.com
- 🐛 [Issues](https://github.com/aihes/xiaohongshu-ai-toolkit/issues)
- 💬 [Discussions](https://github.com/aihes/xiaohongshu-ai-toolkit/discussions)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
