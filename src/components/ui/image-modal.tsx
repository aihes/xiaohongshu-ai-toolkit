import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src, alt, title }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* 标题 */}
        {title && (
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 z-10">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        )}
        
        {/* 图片 */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        />
        
        {/* 底部提示 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
          <p className="text-sm">点击图片外区域或右上角 ✕ 关闭</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
