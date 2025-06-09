
import { CoverStyle } from './CoverGenerator';

interface CoverPreviewProps {
  titleText: string;
  subtitleText: string;
  style: CoverStyle;
  fontSize: number;
}

const CoverPreview = ({ titleText, subtitleText, style, fontSize }: CoverPreviewProps) => {
  const getLayoutClasses = () => {
    switch (style.layout) {
      case 'left':
        return 'items-start text-left pl-8';
      case 'right':
        return 'items-end text-right pr-8';
      case 'bottom':
        return 'justify-end items-center text-center pb-8';
      default:
        return 'items-center text-center';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        id="cover-canvas"
        className={`
          aspect-[4/5] w-full rounded-2xl ${style.background} 
          flex flex-col justify-center ${getLayoutClasses()}
          relative overflow-hidden shadow-2xl
        `}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20"></div>
          <div className="absolute bottom-8 left-4 w-16 h-16 rounded-full bg-white/15"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5"></div>
        </div>

        <div className="relative z-10 space-y-4 px-6 max-w-full">
          {titleText && (
            <h1
              className={`
                ${style.textColor} font-bold leading-tight break-words text-shadow
                ${style.titleSize}
              `}
              style={{ fontSize: `${fontSize}px` }}
            >
              {titleText}
            </h1>
          )}
          
          {subtitleText && (
            <p
              className={`
                ${style.textColor} font-medium leading-relaxed break-words text-shadow opacity-90
                ${style.subtitleSize}
              `}
              style={{ fontSize: `${fontSize * 0.6}px` }}
            >
              {subtitleText}
            </p>
          )}
        </div>

        {/* Brand watermark */}
        <div className="absolute bottom-4 right-4 opacity-60">
          <div className={`${style.textColor} text-xs font-medium`}>
            📱 小红书
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          预览尺寸：800×1000px （小红书推荐比例）
        </p>
      </div>
    </div>
  );
};

export default CoverPreview;
