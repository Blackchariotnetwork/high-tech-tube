import React, { useRef } from 'react';
import { Layers, Play, Share2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { LinkTheme } from '../types';
import { soundFX } from '../utils/audioSynthesizer';

interface ThemeSelectorProps {
  themes: LinkTheme[];
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onBingeTheme: (theme: LinkTheme) => void;
  onShareTheme: (theme: LinkTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  activeThemeId,
  onSelectTheme,
  onBingeTheme,
  onShareTheme,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0];

  return (
    <div className="w-full mb-6">
      {/* Horizontal Theme Scroll Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            5-Video Link Themes ({themes.length} Available)
          </span>
        </div>

        {/* Action Controls & Scroll Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFX.openStream();
              onBingeTheme(activeTheme);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
            title="Binge All 5 Videos in Theme"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play 5</span>
          </button>
          <button
            onClick={() => {
              soundFX.click();
              onShareTheme(activeTheme);
            }}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
            title="Share Theme Link"
            aria-label="Share Theme Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <div className="hidden sm:flex items-center gap-1 ml-1 border-l border-neutral-800 pl-2">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
              title="Scroll left"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
              title="Scroll right"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x scroll-smooth"
      >
        {themes.map((theme) => {
          const isActive = theme.id === activeThemeId;
          return (
            <button
              key={theme.id}
              onClick={() => {
                soundFX.click();
                onSelectTheme(theme.id);
              }}
              className={`snap-start shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all duration-200 whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] font-semibold'
                  : 'bg-[#0d0f17] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
              }`}
            >
              <span className={`text-[11px] font-bold ${isActive ? 'text-black' : 'text-neutral-500'}`}>
                {theme.number}
              </span>
              <span className="truncate max-w-[190px]">{theme.title.split('//')[0].trim()}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-black/10 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                5V
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
