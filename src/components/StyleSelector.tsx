
import { CoverStyle } from './CoverGenerator';

interface StyleSelectorProps {
  styles: CoverStyle[];
  selectedStyle: CoverStyle;
  onStyleSelect: (style: CoverStyle) => void;
}

const StyleSelector = ({ styles, selectedStyle, onStyleSelect }: StyleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onStyleSelect(style)}
          className={`
            relative p-4 rounded-xl transition-all duration-300 border-2
            ${selectedStyle.id === style.id
              ? 'border-xiaohongshu-red shadow-lg scale-105'
              : 'border-gray-200 hover:border-xiaohongshu-pink hover:shadow-md'
            }
          `}
        >
          <div
            className={`
              w-full h-20 rounded-lg ${style.background}
              flex items-center justify-center text-white text-xs font-medium
              shadow-inner
            `}
          >
            <div className="text-center">
              <div className={`${style.textColor} text-sm font-bold mb-1`}>
                标题文字
              </div>
              <div className={`${style.textColor} text-xs opacity-80`}>
                副标题
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700 mt-2 text-center">
            {style.name}
          </p>
          {selectedStyle.id === style.id && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-xiaohongshu-red rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;
