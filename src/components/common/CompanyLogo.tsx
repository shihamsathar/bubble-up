import React from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'plain';
  showText?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
  showText = false,
}) => {
  // Tile dimensions
  const sizeMap = {
    sm: {
      tile: 'w-8 h-8 rounded-lg p-1',
      svg: 'w-5 h-6',
      title: 'text-xs',
      sub: 'text-[9px]',
    },
    md: {
      tile: 'w-11 h-11 rounded-xl p-1.5',
      svg: 'w-7 h-8',
      title: 'text-sm',
      sub: 'text-[10px]',
    },
    lg: {
      tile: 'w-16 h-16 rounded-2xl p-2.5',
      svg: 'w-10 h-12',
      title: 'text-base',
      sub: 'text-xs',
    },
    xl: {
      tile: 'w-24 h-24 rounded-3xl p-3.5',
      svg: 'w-16 h-18',
      title: 'text-xl',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const logoSvg = (
    <svg 
      viewBox="0 0 140 160" 
      className={`${currentSize.svg} shrink-0 drop-shadow-xs transition-transform`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Bubble Up Logo"
    >
      {/* Letter B - Solid Pure Black with sharp geometry matching reference */}
      <path
        d="M20 12 H68 C80 12 90 22 90 40 C90 56 80 68 68 68 C82 68 93 80 93 96 C93 114 82 124 68 124 H20 V12 Z M38 28 V52 H64 C70 52 74 47 74 40 C74 33 70 28 64 28 H38 Z M38 84 V108 H64 C71 108 75 103 75 96 C75 89 71 84 64 84 H38 Z"
        fill="#111111"
        fillRule="evenodd"
      />
      {/* Letter U - Golden Yellow Overlaid & Interlinked (#F5A623) */}
      <path
        d="M46 40 H63 V105 C63 116 72 125 83 125 C94 125 103 116 103 105 V40 H120 V105 C120 128.8 103.4 148 83 148 C62.6 148 46 128.8 46 105 Z"
        fill="#F5A623"
      />
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* High-visibility pristine badge container ensuring 100% color contrast on any dark or light background */}
      {variant === 'badge' ? (
        <div className={`bg-white ${currentSize.tile} shadow-md ring-1 ring-slate-900/10 flex items-center justify-center shrink-0 border border-slate-100 hover:shadow-lg transition-all`}>
          {logoSvg}
        </div>
      ) : (
        <div className="flex items-center justify-center shrink-0">
          {logoSvg}
        </div>
      )}

      {/* Optional Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-white uppercase ${currentSize.title}`}>
              Bubble Up Trading
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              QATAR
            </span>
          </div>
          <span className={`font-medium text-slate-300 ${currentSize.sub}`}>
            Laundry Equipment Sales & Maintenance
          </span>
        </div>
      )}
    </div>
  );
};
