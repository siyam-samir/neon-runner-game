import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Shield } from 'lucide-react';

export const MobileControls: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the device is mobile or tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const dispatchEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
  };

  return (
    <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-end pointer-events-none z-50">
      {/* Left side controls (Movement) */}
      <div className="flex space-x-2 pointer-events-auto">
        <button
          className="w-16 h-16 bg-black/50 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-500 active:bg-cyan-500/30 transition-colors"
          onClick={() => dispatchEvent('mobile-left')}
          onTouchStart={(e) => { e.preventDefault(); dispatchEvent('mobile-left'); }}
        >
          <ArrowLeft size={32} />
        </button>
        <button
          className="w-16 h-16 bg-black/50 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-500 active:bg-cyan-500/30 transition-colors"
          onClick={() => dispatchEvent('mobile-right')}
          onTouchStart={(e) => { e.preventDefault(); dispatchEvent('mobile-right'); }}
        >
          <ArrowRight size={32} />
        </button>
      </div>

      {/* Right side controls (Actions) */}
      <div className="flex space-x-2 pointer-events-auto">
        <button
          className="w-14 h-14 bg-black/50 border-2 border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 active:bg-yellow-400/30 transition-colors mb-8"
          onClick={() => dispatchEvent('mobile-special')}
          onTouchStart={(e) => { e.preventDefault(); dispatchEvent('mobile-special'); }}
        >
          <Shield size={28} />
        </button>
        <button
          className="w-20 h-20 bg-black/50 border-2 border-fuchsia-500 rounded-full flex items-center justify-center text-fuchsia-500 active:bg-fuchsia-500/30 transition-colors"
          onClick={() => dispatchEvent('mobile-jump')}
          onTouchStart={(e) => { e.preventDefault(); dispatchEvent('mobile-jump'); }}
        >
          <ArrowUp size={40} />
        </button>
      </div>
    </div>
  );
};
