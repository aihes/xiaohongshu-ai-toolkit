import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Coins, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

interface Transaction {
  id: string;
  credits: number;
  payment_id: string;
  payment_method: string;
  metadata: {
    status?: string;
    package_name?: string;
    processed_at?: string;
    failed_at?: string;
    error_message?: string;
    credits_added?: number;
  };
  created_at: string;
}

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('获取交易记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'pending':
      default:
        return '处理中';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">请先登录</h1>
              <Button asChild>
                <Link to="/auth">登录</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm">
              <Link to="/credits">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回积分页面
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">交易记录</h1>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">暂无交易记录</h2>
                <p className="text-gray-500 mb-6">您还没有进行过任何积分购买</p>
                <Button asChild>
                  <Link to="/credits">立即购买积分</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(transaction.metadata?.status)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {transaction.metadata?.package_name || '积分包'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleString('zh-CN')}
                          </p>
                          <p className="text-sm text-gray-600">
                            支付ID: {transaction.payment_id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className="w-4 h-4 text-xiaohongshu-red" />
                          <span className="font-bold text-lg">{transaction.credits} 积分</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.metadata?.status)}`}>
                          {getStatusText(transaction.metadata?.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* 详细信息 */}
                    {transaction.metadata?.status === 'completed' && transaction.metadata?.processed_at && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-green-600">
                          ✅ 处理完成时间: {new Date(transaction.metadata.processed_at).toLocaleString('zh-CN')}
                        </p>
                        {transaction.metadata?.credits_added && (
                          <p className="text-sm text-green-600">
                            ✅ 已添加 {transaction.metadata.credits_added} 积分到账户
                          </p>
                        )}
                      </div>
                    )}
                    
                    {transaction.metadata?.status === 'failed' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-red-600">
                          ❌ 失败时间: {transaction.metadata?.failed_at ? new Date(transaction.metadata.failed_at).toLocaleString('zh-CN') : '未知'}
                        </p>
                        {transaction.metadata?.error_message && (
                          <p className="text-sm text-red-600">
                            错误信息: {transaction.metadata.error_message}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {transaction.metadata?.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-yellow-600">
                          ⏳ 交易正在处理中，请稍候...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
