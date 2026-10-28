import React from 'react';
import { Grid, Layers, PlayCircle, Bookmark, PlusCircle } from 'lucide-react';
import { NavTab } from '../types';
import { soundFX } from '../utils/audioSynthesizer';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveVideo: boolean;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveVideo,
  savedCount,
}) => {
  const tabs = [
    { id: 'feed' as NavTab, label: '5-Matrix', icon: Grid },
    { id: 'themes' as NavTab, label: 'Themes', icon: Layers },
    { id: 'player' as NavTab, label: 'Player', icon: PlayCircle, highlight: hasActiveVideo },
    { id: 'saved' as NavTab, label: 'Saved', icon: Bookmark, badge: savedCount > 0 ? savedCount : null },
    { id: 'create' as NavTab, label: 'Custom 5', icon: PlusCircle },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080c]/95 backdrop-blur-xl border-t border-neutral-800/90 pb-safe">
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.click();
                onTabChange(tab.id);
              }}
              className="flex flex-col items-center justify-center min-h-[48px] w-full relative group transition-colors"
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'text-white scale-110'
                      : tab.highlight
                      ? 'text-emerald-400'
                      : 'text-neutral-500 group-hover:text-neutral-300'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-white text-black px-1 rounded-full leading-tight">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-neutral-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
