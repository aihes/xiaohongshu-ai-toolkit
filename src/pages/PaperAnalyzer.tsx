import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Image,
  Coins,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Brain,
  Camera,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

interface AnalysisResult {
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  keywords: string[];
  figures: {
    url: string;
    caption: string;
    type: string;
  }[];
  downloadUrl?: string;
}

const PaperAnalyzer = () => {
  const { user } = useAuth();
  const { credits, decrementCredits } = useCredits();
  const [paperUrl, setPaperUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<'summary' | 'images' | 'full'>('summary');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analysisOptions = [
    {
      id: 'summary' as const,
      name: '论文总结',
      description: '提取论文核心内容、摘要和关键观点',
      credits: 5,
      icon: Brain,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'images' as const,
      name: '图片提取',
      description: '提取论文中的所有图表、公式和图片',
      credits: 3,
      icon: Camera,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'full' as const,
      name: '完整分析',
      description: '论文总结 + 图片提取 + 关键词分析',
      credits: 8,
      icon: Package,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const supportedSites = [
    {
      name: 'arXiv (摘要页)',
      example: 'https://arxiv.org/abs/2405.10467',
      pattern: /arxiv\.org\/abs\/[\d.]+v?\d*/
    },
    {
      name: 'arXiv (PDF直链)',
      example: 'https://arxiv.org/pdf/2405.10467.pdf',
      pattern: /arxiv\.org\/pdf\/[\d.]+v?\d*(\.pdf)?/
    },
    {
      name: 'PubMed',
      example: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      pattern: /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/
    },
    {
      name: 'IEEE',
      example: 'https://ieeexplore.ieee.org/document/1234567',
      pattern: /ieeexplore\.ieee\.org\/document\/\d+/
    },
    {
      name: 'ACM',
      example: 'https://dl.acm.org/doi/10.1145/1234567.1234568',
      pattern: /dl\.acm\.org\/doi/
    }
  ];

  const validateUrl = (url: string) => {
    return supportedSites.some(site => site.pattern.test(url));
  };

  const getRequiredCredits = () => {
    const option = analysisOptions.find(opt => opt.id === analysisType);
    return option?.credits || 0;
  };

  const handleTestUrl = async () => {
    if (!paperUrl.trim()) {
      toast.error('请输入论文链接');
      return;
    }

    if (!validateUrl(paperUrl)) {
      toast.error('URL 格式不正确，请检查链接格式');
      return;
    }

    toast.success('URL 格式验证通过！');

    // 简单的 arXiv 信息提取测试
    if (paperUrl.includes('arxiv.org')) {
      const absMatch = paperUrl.match(/arxiv\.org\/abs\/([\d.]+v?\d*)/);
      const pdfMatch = paperUrl.match(/arxiv\.org\/pdf\/([\d.]+v?\d*)/);

      if (absMatch || pdfMatch) {
        const paperId = (absMatch || pdfMatch)?.[1];
        toast.info(`检测到 arXiv 论文 ID: ${paperId}`);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!paperUrl.trim()) {
      toast.error('请输入论文链接');
      return;
    }

    if (!validateUrl(paperUrl)) {
      toast.error('暂不支持该网站，请使用 arXiv、PubMed、IEEE 或 ACM 的论文链接');
      return;
    }

    const requiredCredits = getRequiredCredits();
    if (credits < requiredCredits) {
      toast.error(`积分不足，需要 ${requiredCredits} 积分`);
      return;
    }

    setIsAnalyzing(true);
    try {
      // 获取当前会话信息
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('用户会话已过期，请重新登录');
        return;
      }

      // 直接使用 fetch API 调用 Edge Function，这样可以更好地处理错误响应
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-paper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          paperUrl: paperUrl.trim(),
          analysisType,
          userId: user.id
        })
      });

      // 无论状态码是什么，都尝试解析响应体
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('响应解析失败:', parseError);
        toast.error('服务器响应格式错误，请重试');
        return;
      }

      // 检查响应状态
      if (response.ok) {
        // 200状态码，检查业务逻辑成功状态
        if (responseData.success) {
          setResult(responseData.result);
          decrementCredits(requiredCredits);
          toast.success(`论文分析完成！消耗 ${requiredCredits} 积分`);
        } else {
          // 业务逻辑错误
          toast.error(responseData.error || '分析失败，请重试');
        }
      } else {
        // 非200状态码，但服务端可能返回了结构化的错误信息
        console.error(`HTTP ${response.status}:`, responseData);

        if (responseData && responseData.error) {
          // 服务端返回了结构化的错误信息
          toast.error(responseData.error);
        } else {
          // 没有结构化错误信息，使用默认消息
          toast.error(`服务器错误 (${response.status})，请重试`);
        }
      }
    } catch (error) {
      console.error('论文分析失败:', error);

      // 处理网络错误或其他异常
      let errorMessage = '分析失败，请重试';

      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请重试';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.downloadUrl) {
      toast.error('没有可下载的内容');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `${result.title.slice(0, 50)}_analysis.zip`;
      link.click();
      toast.success('开始下载分析结果');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请重试');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">请先登录</h1>
              <p className="text-gray-600 mb-6">登录后即可使用 AI 论文分析功能</p>
              <Button asChild className="w-full">
                <Link to="/auth">立即登录</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              AI 论文分析器
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              智能解析学术论文，提取核心内容和图表，让研究更高效
            </p>
          </div>

          {/* 积分显示 */}
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6" />
                  <span className="text-lg font-semibold">当前积分: {credits}</span>
                </div>
                <Button asChild variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Link to="/credits">充值积分</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 分析选项 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                选择分析类型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = analysisType === option.id;
                  const canAfford = credits >= option.credits;

                  return (
                    <div
                      key={option.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : canAfford
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => canAfford && setAnalysisType(option.id)}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${option.color} rounded-lg mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${canAfford ? 'text-blue-600' : 'text-red-500'}`}>
                          {option.credits} 积分
                        </span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-blue-500" />}
                        {!canAfford && <AlertCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 论文链接输入 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                输入论文链接
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="请输入论文链接，如: https://arxiv.org/pdf/2405.10467"
                  value={paperUrl}
                  onChange={(e) => setPaperUrl(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* 支持的网站 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">支持的论文网站:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {supportedSites.map((site) => (
                    <div key={site.name} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{site.name}:</span>
                      <code className="text-xs bg-white px-2 py-1 rounded">{site.example}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleTestUrl}
                  disabled={!paperUrl.trim()}
                  variant="outline"
                  className="flex-1 h-12 border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  验证链接
                </Button>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !paperUrl.trim() || credits < getRequiredCredits()}
                  className="flex-2 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      开始分析 ({getRequiredCredits()} 积分)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 分析结果 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  分析结果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 论文基本信息 */}
                <div>
                  <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                  <p className="text-gray-600 mb-2">
                    作者: {result.authors.join(', ')}
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">摘要:</h4>
                    <p className="text-gray-700">{result.abstract}</p>
                  </div>
                </div>

                {/* 核心总结 */}
                {(analysisType === 'summary' || analysisType === 'full') && (
                  <div>
                    <h4 className="font-semibold mb-2">核心内容总结:</h4>
                    <Textarea
                      value={result.summary}
                      readOnly
                      className="min-h-[200px]"
                    />
                  </div>
                )}

                {/* 关键词 */}
                {result.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">关键词:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 图片展示 */}
                {(analysisType === 'images' || analysisType === 'full') && result.figures.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">提取的图表 ({result.figures.length} 张):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.figures.map((figure, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <img
                            src={figure.url}
                            alt={figure.caption}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <p className="text-sm text-gray-600">{figure.caption}</p>
                          <span className="text-xs text-gray-500">{figure.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 下载按钮 */}
                {result.downloadUrl && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleDownload}
                      className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white font-medium"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      下载完整分析结果 (.zip)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperAnalyzer;
