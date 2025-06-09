
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { CheckCircle, Coins, AlertCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshCredits } = useCredits();
  const [verifying, setVerifying] = useState(true);
  const [credits, setCredits] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        console.error('Payment verification error:', error);
        setError('支付验证失败，请联系客服');
        return;
      }

      if (data.status === 'paid') {
        setCredits(data.credits);
        // 刷新用户积分显示
        await refreshCredits();
      } else {
        setError('支付未完成，请重试');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('支付验证失败，请联系客服');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md xiaohongshu-shadow border-0">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-xiaohongshu-gradient rounded-2xl mb-4 animate-pulse">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              正在验证支付...
            </h1>
            <p className="text-gray-600">
              请稍候，我们正在确认您的付款
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md xiaohongshu-shadow border-0">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              支付验证失败
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              {error}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-xiaohongshu-gradient hover:opacity-90 text-white font-medium"
              >
                重新验证
              </Button>

              <Button asChild variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                <Link to="/credits">
                  返回积分页面
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 flex items-center justify-center">
      <Card className="w-full max-w-md xiaohongshu-shadow border-0">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            支付成功！
          </h1>

          {credits && (
            <p className="text-lg text-gray-600 mb-6">
              您已成功获得 <span className="font-bold text-xiaohongshu-red">{credits} 积分</span>
            </p>
          )}

          <p className="text-gray-600 mb-8">
            积分已添加到您的账户，您现在可以开始生成精美的封面了！
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full h-12 bg-xiaohongshu-gradient hover:opacity-90 text-white font-medium">
              <Link to="/">
                开始生成封面
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
              <Link to="/credits">
                查看我的积分
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
