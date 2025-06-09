import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Coins, Sparkles, Star, Crown, Gift, MessageCircle, History } from 'lucide-react';
import ImageModal from '@/components/ui/image-modal';
import { Link } from 'react-router-dom';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  currency: string;
  description: string;
}

interface UserCredits {
  remaining_credits: number;
  total_purchased: number;
  total_usage: number;
}

const CreditStore = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    fetchCreditPackages();
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchCreditPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      toast.error('获取积分包信息失败');
    }
  };

  const fetchUserCredits = async () => {
    try {
      console.log('正在获取用户积分，用户ID:', user?.id);

      // 使用正确的查询条件
      const { data, error } = await supabase
        .from('users')
        .select('remaining_credits, total_purchased, total_usage')
        .eq('id', user?.id)
        .single();

      if (error) {
        // 如果记录不存在（error code 'PGRST116'），则创建新记录
        if (error.code === 'PGRST116') {
          console.log('用户记录不存在，正在创建新用户记录');

          // 使用 upsert 避免重复插入
          const { data: newData, error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: user?.id,
              email: user?.email,
              remaining_credits: 10,
              total_purchased: 10,
              total_usage: 0
            }, {
              onConflict: 'id'
            })
            .select('remaining_credits, total_purchased, total_usage')
            .single();

          if (upsertError) {
            console.error('创建用户记录失败:', upsertError);
            throw upsertError;
          }

          console.log('新用户记录创建成功:', newData);
          setUserCredits(newData);
        } else {
          throw error;
        }
      } else {
        console.log('找到用户记录:', data);
        setUserCredits(data);
      }
    } catch (error) {
      console.error('获取用户积分失败:', error);
      // 设置默认值避免显示错误
      setUserCredits({
        remaining_credits: 0,
        total_purchased: 0,
        total_usage: 0
      });
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    setPurchasingPackage(packageId);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { packageId }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error('创建支付失败，请重试');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
      setPurchasingPackage(null);
    }
  };

  const formatPrice = (priceCents: number, currency: string) => {
    const price = priceCents / 100;
    return currency === 'cny' ? `¥${price}` : `$${price}`;
  };

  const getPackageIcon = (index: number) => {
    const icons = [Gift, Coins, Sparkles, Star, Crown];
    const Icon = icons[index] || Coins;
    return Icon;
  };

  const getPackageColor = (index: number) => {
    const colors = [
      'from-green-500 to-green-600',
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-yellow-500 to-yellow-600'
    ];
    return colors[index] || colors[0];
  };

  const getPackageBadge = (pkg: CreditPackage) => {
    if (pkg.name === '尝试包') {
      return (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          新手推荐
        </div>
      );
    }
    return null;
  };

  const refreshCredits = async () => {
    if (user) {
      await fetchUserCredits();
      toast.success('积分信息已刷新');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 用户积分概览 */}
      {userCredits && (
        <Card className="mb-8 bg-gradient-to-r from-xiaohongshu-red to-xiaohongshu-pink text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">我的积分</h2>
                <p className="text-white/90">剩余积分: {userCredits.remaining_credits}</p>
              </div>
              <div className="text-right">
                <p className="text-white/90">累计购买: {userCredits.total_purchased}</p>
                <p className="text-white/90">累计使用: {userCredits.total_usage}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={refreshCredits}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    刷新积分
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <Link to="/transactions">
                      <History className="w-4 h-4 mr-1" />
                      交易记录
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 积分包列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => {
          const Icon = getPackageIcon(index);
          const colorClass = getPackageColor(index);
          const isPurchasing = purchasingPackage === pkg.id;

          return (
            <Card key={pkg.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {getPackageBadge(pkg)}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`} />

              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${colorClass} rounded-2xl mb-4 mx-auto`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                <p className="text-gray-600">{pkg.description}</p>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {pkg.credits} 积分
                  </div>
                  <div className="text-2xl font-bold text-xiaohongshu-red">
                    {formatPrice(pkg.price_cents, pkg.currency)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    每积分 ¥{(pkg.price_cents / 100 / pkg.credits).toFixed(3)}
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading || isPurchasing}
                  className={`w-full h-12 bg-gradient-to-r ${colorClass} hover:opacity-90 text-white font-medium`}
                >
                  {isPurchasing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      处理中...
                    </div>
                  ) : (
                    '立即购买'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 使用说明 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>积分说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium mb-2">如何使用积分：</h4>
              <ul className="space-y-1">
                <li>• 每次生成封面消耗 1 积分</li>
                <li>• 高级模板可能消耗更多积分</li>
                <li>• 积分永不过期</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">购买须知：</h4>
              <ul className="space-y-1">
                <li>• 支持微信、支付宝等支付方式</li>
                <li>• 购买后积分立即到账</li>
                <li>• 如有问题请联系客服</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                客服支持：
              </h4>
              <div className="space-y-2">
                <p>如遇支付问题，请添加客服微信：</p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <img
                    src="/lovable-uploads/d997d2d5-853f-4d5b-b771-7440522dc207.png"
                    alt="客服微信二维码"
                    className="w-32 h-32 mx-auto mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                    title="点击查看大图"
                  />
                  <p className="text-center text-xs text-gray-500">点击查看大图 · 扫码添加客服微信</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图片预览模态框 */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        src="/lovable-uploads/d997d2d5-853f-4d5b-b771-7440522dc207.png"
        alt="客服微信二维码"
        title="客服微信二维码"
      />
    </div>
  );
};

export default CreditStore;
