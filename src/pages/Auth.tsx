
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  // 如果用户已登录，重定向到主页
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请填写所有必填字段');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, username);
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          toast.error('邮箱或密码错误');
        } else if (result.error.message.includes('User already registered')) {
          toast.error('该邮箱已注册，请直接登录');
        } else {
          toast.error(result.error.message);
        }
      } else {
        if (isLogin) {
          toast.success('登录成功！');
          window.location.href = '/';
        } else {
          toast.success('注册成功！请检查邮箱进行验证');
        }
      }
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Google 登录失败');
      }
    } catch (error) {
      toast.error('Google 登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        toast.error('GitHub 登录失败');
      }
    } catch (error) {
      toast.error('GitHub 登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md xiaohongshu-shadow border-0">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-xiaohongshu-gradient rounded-2xl mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-xiaohongshu-red to-xiaohongshu-pink bg-clip-text text-transparent mb-2">
              {isLogin ? '登录账户' : '创建账户'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? '欢迎回来！请登录您的账户' : '注册后即可使用封面生成器'}
            </p>
          </div>

          {/* OAuth 登录按钮 */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-gray-200 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </Button>
            
            <Button
              onClick={handleGitHubLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-gray-200 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              使用 GitHub 登录
            </Button>
          </div>

          {/* 分割线 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">或者使用邮箱</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  用户名 (可选)
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="输入您的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-gray-200 focus:border-xiaohongshu-red focus:ring-xiaohongshu-red"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4" />
                邮箱地址
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="输入您的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-xiaohongshu-red focus:ring-xiaohongshu-red"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-4 h-4" />
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="输入您的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-gray-200 focus:border-xiaohongshu-red focus:ring-xiaohongshu-red"
              />
              {!isLogin && (
                <p className="text-xs text-gray-500">密码至少需要6个字符</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-xiaohongshu-gradient hover:opacity-90 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isLogin ? '登录中...' : '注册中...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? '登录' : '注册'}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xiaohongshu-red hover:text-xiaohongshu-pink transition-colors"
            >
              {isLogin ? '还没有账户？点击注册' : '已有账户？点击登录'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
