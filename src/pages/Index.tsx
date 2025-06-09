
import CoverGenerator from '@/components/CoverGenerator';
import Header from '@/components/Header';
import SentryTest from '@/components/SentryTest';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-xiaohongshu-gradient rounded-2xl mb-6 animate-float">
            <span className="text-2xl">🎨</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-xiaohongshu-red to-xiaohongshu-pink bg-clip-text text-transparent mb-4">
            AI 创作工具箱
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            集成多种 AI 工具，让创作更高效、更智能
          </p>

          {/* 功能选择 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* 封面生成器 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">小红书封面生成器</h2>
              <p className="text-gray-600 mb-6">
                输入文字内容，一键生成精美的小红书风格营销封面图
              </p>
              <div className="text-sm text-gray-500 mb-4">
                💰 每次生成消耗 1 积分
              </div>
            </div>

            {/* 论文分析器 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI 论文分析器</h2>
              <p className="text-gray-600 mb-6">
                智能解析学术论文，提取核心内容和图表，让研究更高效
              </p>
              <div className="text-sm text-gray-500 mb-4">
                💰 论文总结 5积分 | 图片提取 3积分 | 完整分析 8积分
              </div>
              <a
                href="/paper-analyzer"
                className="inline-flex items-center justify-center w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                立即体验
              </a>
            </div>
          </div>
        </div>

        <CoverGenerator />

        {/* Sentry 测试组件 - 仅在开发环境显示 */}
        {import.meta.env.DEV && (
          <div className="mt-12">
            <SentryTest />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
