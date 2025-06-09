
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import CoverPreview from './CoverPreview';
import StyleSelector from './StyleSelector';
import { Button } from '@/components/ui/button';
import { Download, Palette, Type, Sparkles, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export interface CoverStyle {
  id: string;
  name: string;
  background: string;
  textColor: string;
  titleSize: string;
  subtitleSize: string;
  layout: 'center' | 'left' | 'right' | 'bottom';
}

const coverStyles: CoverStyle[] = [
  {
    id: 'classic',
    name: '经典红书',
    background: 'bg-xiaohongshu-gradient',
    textColor: 'text-white',
    titleSize: 'text-3xl',
    subtitleSize: 'text-lg',
    layout: 'center',
  },
  {
    id: 'warm',
    name: '温暖橘调',
    background: 'bg-warm-gradient',
    textColor: 'text-white',
    titleSize: 'text-3xl',
    subtitleSize: 'text-lg',
    layout: 'center',
  },
  {
    id: 'sunset',
    name: '日落黄昏',
    background: 'bg-sunset-gradient',
    textColor: 'text-white',
    titleSize: 'text-3xl',
    subtitleSize: 'text-lg',
    layout: 'center',
  },
  {
    id: 'pink',
    name: '粉色梦幻',
    background: 'bg-pink-gradient',
    textColor: 'text-gray-800',
    titleSize: 'text-3xl',
    subtitleSize: 'text-lg',
    layout: 'center',
  },
  {
    id: 'minimal',
    name: '简约白净',
    background: 'bg-white',
    textColor: 'text-gray-800',
    titleSize: 'text-3xl',
    subtitleSize: 'text-lg',
    layout: 'center',
  },
  {
    id: 'dark',
    name: '深邃黑金',
    background: 'bg-gradient-to-br from-gray-900 to-black',
    textColor: 'text-yellow-300',
    titleSize: 'text-3xl',
    subtitleSize: 'text-lg',
    layout: 'center',
  },
];

const CoverGenerator = () => {
  const { user } = useAuth();
  const { credits, decrementCredits, refreshCredits } = useCredits();
  const [selectedStyle, setSelectedStyle] = useState<CoverStyle>(coverStyles[0]);
  const [fontSize, setFontSize] = useState(32);
  const [titleText, setTitleText] = useState('分享生活的美好时光');
  const [subtitleText, setSubtitleText] = useState('记录每个精彩瞬间');
  const [isDownloading, setIsDownloading] = useState(false);



  const handleDownload = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (credits < 1) {
      toast.error('积分不足，请先充值');
      return;
    }

    setIsDownloading(true);
    try {
      // 先获取当前用户数据并扣减积分
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('remaining_credits, total_usage')
        .eq('id', user.id)
        .single();

      if (fetchError || !userData) {
        console.error('获取用户数据失败:', fetchError);
        toast.error('获取用户数据失败，请重试');
        return;
      }

      const { error: creditError } = await supabase
        .from('users')
        .update({
          remaining_credits: userData.remaining_credits - 1,
          total_usage: (userData.total_usage || 0) + 1
        })
        .eq('id', user.id);

      if (creditError) {
        console.error('扣减积分失败:', creditError);
        toast.error('积分扣减失败，请重试');
        return;
      }

      // 记录积分使用日志
      await supabase.from('credit_usage').insert({
        user_id: user.id,
        action_type: 'generate_cover',
        credits_used: 1,
        metadata: {
          image_format: 'png',
          image_width: 1080,
          image_height: 1350
        }
      });

      const canvas = document.getElementById('cover-canvas') as HTMLCanvasElement;
      if (!canvas) {
        toast.error('无法找到画布元素');
        return;
      }

      // Create a temporary canvas for downloading
      const downloadCanvas = document.createElement('canvas');
      const ctx = downloadCanvas.getContext('2d');
      if (!ctx) {
        toast.error('无法创建下载画布');
        return;
      }

      // Set canvas size to common social media cover size
      downloadCanvas.width = 1080;
      downloadCanvas.height = 1350;

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, downloadCanvas.width, downloadCanvas.height);
      if (selectedStyle.id === 'classic') {
        gradient.addColorStop(0, '#ff4757');
        gradient.addColorStop(0.5, '#ff6b7a');
        gradient.addColorStop(1, '#ffa726');
      } else if (selectedStyle.id === 'warm') {
        gradient.addColorStop(0, '#ffeaa7');
        gradient.addColorStop(0.5, '#fab1a0');
        gradient.addColorStop(1, '#fd79a8');
      } else if (selectedStyle.id === 'sunset') {
        gradient.addColorStop(0, '#ff9a8b');
        gradient.addColorStop(1, '#fad0c4');
      } else if (selectedStyle.id === 'pink') {
        gradient.addColorStop(0, '#ffecd2');
        gradient.addColorStop(1, '#fcb69f');
      } else if (selectedStyle.id === 'minimal') {
        ctx.fillStyle = '#ffffff';
      } else if (selectedStyle.id === 'dark') {
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(1, '#000000');
      }

      if (selectedStyle.id !== 'minimal') {
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

      // Set text style
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = selectedStyle.textColor === 'text-white' ? '#ffffff' :
                      selectedStyle.textColor === 'text-gray-800' ? '#1f2937' : '#fbbf24';

      // Draw title
      ctx.font = 'bold 64px "Noto Sans SC", sans-serif';
      ctx.fillText(titleText, downloadCanvas.width / 2, downloadCanvas.height / 2 - 40);

      // Draw subtitle
      ctx.font = '48px "Noto Sans SC", sans-serif';
      ctx.fillText(subtitleText, downloadCanvas.width / 2, downloadCanvas.height / 2 + 60);

      // Download
      const link = document.createElement('a');
      link.download = '小红书封面.png';
      link.href = downloadCanvas.toDataURL();
      link.click();

      // 更新本地积分显示
      decrementCredits(1);

      toast.success('封面图已下载！消耗 1 积分');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <Card className="xiaohongshu-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-xiaohongshu-red" />
                <Label className="text-lg font-semibold">文字内容</Label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                    主标题
                  </Label>
                  <Textarea
                    id="title"
                    placeholder="输入主标题文字..."
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="min-h-[60px] resize-none border-gray-200 focus:border-xiaohongshu-red focus:ring-xiaohongshu-red"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle" className="text-sm font-medium text-gray-700 mb-2 block">
                    副标题
                  </Label>
                  <Textarea
                    id="subtitle"
                    placeholder="输入副标题文字..."
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="min-h-[60px] resize-none border-gray-200 focus:border-xiaohongshu-red focus:ring-xiaohongshu-red"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xiaohongshu-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-xiaohongshu-red" />
                <Label className="text-lg font-semibold">选择样式</Label>
              </div>
              <StyleSelector
                styles={coverStyles}
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
              />
            </CardContent>
          </Card>

          <Card className="xiaohongshu-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-xiaohongshu-red" />
                <Label className="text-lg font-semibold">字体大小</Label>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">大小调节</span>
                  <span className="text-sm font-medium">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </CardContent>
          </Card>

          {/* 积分显示 */}
          {user && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-xiaohongshu-red" />
                <span className="text-sm text-gray-600">当前积分:</span>
                <span className="font-semibold text-xiaohongshu-red">{credits}</span>
              </div>
              <div className="text-xs text-gray-500">
                下载消耗 1 积分
              </div>
            </div>
          )}

          {user ? (
            credits >= 1 ? (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full h-12 bg-xiaohongshu-gradient hover:opacity-90 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    下载中...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    下载封面图 (消耗 1 积分)
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  disabled
                  className="w-full h-12 bg-gray-300 text-gray-500 font-medium text-lg cursor-not-allowed"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  积分不足
                </Button>
                <Button asChild className="w-full h-10 bg-xiaohongshu-gradient hover:opacity-90 text-white font-medium">
                  <Link to="/credits">
                    <Coins className="w-4 h-4 mr-2" />
                    立即充值
                  </Link>
                </Button>
              </div>
            )
          ) : (
            <Button asChild className="w-full h-12 bg-xiaohongshu-gradient hover:opacity-90 text-white font-medium text-lg">
              <Link to="/auth">
                登录后下载
              </Link>
            </Button>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:sticky lg:top-8">
          <Card className="xiaohongshu-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">👀</span>
                <Label className="text-lg font-semibold">实时预览</Label>
              </div>
              <CoverPreview
                titleText={titleText}
                subtitleText={subtitleText}
                style={selectedStyle}
                fontSize={fontSize}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoverGenerator;
