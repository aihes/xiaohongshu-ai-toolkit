
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { LogOut, User, Coins, ShoppingCart, Brain, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
      window.location.href = '/auth';
    } catch (error) {
      toast.error('退出登录失败');
    }
  };

  if (!user) return null;

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-xiaohongshu-gradient rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎨</span>
              </div>
              <h2 className="font-semibold text-gray-800">AI 创作工具箱</h2>
            </Link>

            {/* 导航菜单 */}
            <nav className="hidden md:flex items-center gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-xiaohongshu-red text-white'
                    : 'text-gray-600 hover:text-xiaohongshu-red hover:bg-gray-50'
                }`}
              >
                <Image className="w-4 h-4" />
                封面生成
              </Link>
              <Link
                to="/paper-analyzer"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/paper-analyzer'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                }`}
              >
                <Brain className="w-4 h-4" />
                论文分析
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* 积分显示 */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-xiaohongshu-red to-xiaohongshu-pink rounded-full px-3 py-1 text-white text-sm">
              <Coins className="w-4 h-4" />
              <span>{credits || 0} 积分</span>
            </div>

            {/* 购买积分按钮 */}
            <Button asChild variant="outline" size="sm" className="border-xiaohongshu-red text-xiaohongshu-red hover:bg-xiaohongshu-red hover:text-white">
              <Link to="/credits">
                <ShoppingCart className="w-4 h-4 mr-2" />
                充值
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-gray-200 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
