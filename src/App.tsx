import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Plus,
  Bookmark,
  Share2,
  Search,
  SlidersHorizontal,
  Activity,
  Play,
  RotateCcw,
  Check,
  Eye,
  Film
} from 'lucide-react';
import { VideoItem, LinkTheme, NavTab, ViewMode } from './types';
import { INITIAL_THEMES, USER_LOGO_PATH } from './data/videoThemes';
import { VideoCard3D } from './components/VideoCard3D';
import { TheaterPlayer } from './components/TheaterPlayer';
import { ThemeSelector } from './components/ThemeSelector';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CustomThemeModal } from './components/CustomThemeModal';
import { CyberBackground } from './components/CyberBackground';
import { soundFX } from './utils/audioSynthesizer';

export default function App() {
  // Load themes & saved state with localStorage persistence
  const [themes, setThemes] = useState<LinkTheme[]>(() => {
    try {
      const saved = localStorage.getItem('kuro_custom_themes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_THEMES, ...parsed];
      }
    } catch {
      // Fallback
    }
    return INITIAL_THEMES;
  });

  const [activeThemeId, setActiveThemeId] = useState<string>('theme-anime-gaze');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kuro_saved_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('3d-grid');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeSlotFilter, setActiveSlotFilter] = useState<number | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Sync sound setting
  useEffect(() => {
    soundFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Persist saved videos
  useEffect(() => {
    try {
      localStorage.setItem('kuro_saved_videos', JSON.stringify(savedVideoIds));
    } catch {
      // Ignore
    }
  }, [savedVideoIds]);

  // Read URL parameters on load for deep linking (e.g., ?theme=...&v=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    const videoParam = params.get('v');

    if (themeParam) {
      const foundTheme = themes.find((t) => t.id === themeParam || t.number === themeParam);
      if (foundTheme) {
        setActiveThemeId(foundTheme.id);
        if (videoParam) {
          const vIdx = parseInt(videoParam, 10);
          const foundVid = foundTheme.videos.find((v) => v.index === vIdx);
          if (foundVid) {
            setActiveVideo(foundVid);
          }
        }
      }
    }
  }, [themes]);

  // Active theme calculation
  const activeTheme = useMemo(() => {
    return themes.find((t) => t.id === activeThemeId) || themes[0];
  }, [themes, activeThemeId]);

  // All videos flattened
  const allVideos = useMemo(() => {
    return themes.flatMap((t) => t.videos);
  }, [themes]);

  // Toggle save
  const toggleSaveVideo = (video: VideoItem) => {
    setSavedVideoIds((prev) => {
      const exists = prev.includes(video.id);
      if (exists) {
        return prev.filter((id) => id !== video.id);
      } else {
        return [...prev, video.id];
      }
    });
  };

  // Share link handler
  const handleShareVideo = (video: VideoItem) => {
    const url = `${window.location.origin}${window.location.pathname}?theme=${video.themeId}&v=${video.index}`;
    navigator.clipboard?.writeText(url);
    setCopiedNotification(`Copied 5-Link URL for 0${video.index}: ${video.title}`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleShareTheme = (theme: LinkTheme) => {
    const url = `${window.location.origin}${window.location.pathname}?theme=${theme.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedNotification(`Copied Link Theme: ${theme.title}`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Add custom theme
  const handleSaveCustomTheme = (newTheme: LinkTheme) => {
    const updated = [newTheme, ...themes];
    setThemes(updated);
    setActiveThemeId(newTheme.id);
    setActiveTab('feed');
    try {
      const customOnly = updated.filter((t) => t.isCustom);
      localStorage.setItem('kuro_custom_themes', JSON.stringify(customOnly));
    } catch {
      // Ignore
    }
  };

  // Filtered videos based on search or slot filter
  const displayedVideos = useMemo(() => {
    let list = activeTheme.videos;

    if (activeTab === 'saved') {
      list = allVideos.filter((v) => savedVideoIds.includes(v.id));
    } else if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = allVideos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.creator.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    } else if (activeSlotFilter !== null) {
      list = list.filter((v) => v.index === activeSlotFilter);
    }

    return list;
  }, [activeTheme, activeTab, allVideos, savedVideoIds, searchQuery, activeSlotFilter]);

  return (
    <div className="relative min-h-screen bg-[#050608] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Modern Cybernetic Animated Background */}
      <CyberBackground />

      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Top Bar Contract (3 zones, gap-8) */}
      <header className="sticky top-0 z-40 bg-[#07080c]/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Natural Brand Logo without cropping or text */}
        <div
          onClick={() => {
            setActiveTab('feed');
            setActiveSlotFilter(null);
            setSearchQuery('');
          }}
          className="cursor-pointer shrink-0 group select-none flex items-center"
          title="Home"
          aria-label="Home"
        >
          <img
            src={USER_LOGO_PATH}
            alt="Logo"
            className="h-10 sm:h-11 w-auto object-contain rounded-md border border-neutral-800/80 group-hover:border-neutral-500 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-200"
          />
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => {
              setActiveTab('feed');
              soundFX.click();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'feed' ? 'text-white underline underline-offset-8 decoration-neutral-500' : ''
            }`}
          >
            5-Video Matrix
          </button>
          <button
            onClick={() => {
              setActiveTab('themes');
              soundFX.click();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'themes' ? 'text-white underline underline-offset-8 decoration-neutral-500' : ''
            }`}
          >
            All Themes
          </button>
          <button
            onClick={() => {
              setActiveTab('saved');
              soundFX.click();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'saved' ? 'text-white underline underline-offset-8 decoration-neutral-500' : ''
            }`}
          >
            <span>Saved Sets</span>
            {savedVideoIds.length > 0 && (
              <span className="text-[10px] font-mono font-bold bg-neutral-800 px-1.5 py-0.2 rounded text-neutral-300">
                {savedVideoIds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setShowCreateModal(true);
              soundFX.click();
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-emerald-400"
          >
            + Create 5-Set
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Point */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sound FX Acoustic feedback toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              soundFX.click();
            }}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
            title={soundEnabled ? 'Mute Interface Soundscapes' : 'Enable Futuristic Audio Cues'}
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              soundFX.click();
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-black bg-white rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Curate 5-Set</span>
            <span className="sm:hidden">Curate</span>
          </button>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 pb-24 sm:pb-12">

        {/* Global Search & View Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter streams by title, creator, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f17] border border-neutral-800 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode & Matrix Stats */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5 bg-[#0d0f17] border border-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  setViewMode('3d-grid');
                  soundFX.click();
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === '3d-grid' ? 'bg-white text-black font-semibold' : 'hover:text-white'
                }`}
              >
                3D Matrix
              </button>
              <button
                onClick={() => {
                  setViewMode('cinema-reel');
                  soundFX.click();
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'cinema-reel' ? 'bg-white text-black font-semibold' : 'hover:text-white'
                }`}
              >
                Cinema Reel
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1 px-3 py-2 rounded-xl bg-[#0d0f17] border border-neutral-800">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>&lt;20ms Latency</span>
            </div>
          </div>
        </div>

        {/* Tab 1 & Feed: Theme Selector & 5-Video Matrix */}
        {activeTab === 'feed' && !searchQuery && (
          <ThemeSelector
            themes={themes}
            activeThemeId={activeThemeId}
            onSelectTheme={(id) => {
              setActiveThemeId(id);
              setActiveSlotFilter(null);
            }}
            onBingeTheme={(theme) => {
              setActiveVideo(theme.videos[0]);
            }}
            onShareTheme={handleShareTheme}
          />
        )}

        {/* Tab 2: All Themes Directory View */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-white">All 5-Video Link Themes</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Explore every curated set of five video streams.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-emerald-400 hover:border-neutral-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Theme</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => {
                    setActiveThemeId(theme.id);
                    setActiveTab('feed');
                    soundFX.click();
                  }}
                  className="group p-4 rounded-2xl bg-[#0d0f17] border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-2">
                      <span className="font-bold text-white">{theme.number}</span>
                      <span>5 Curated Streams</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-neutral-200 transition-colors">
                      {theme.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>

                  {/* 5-Video Mini Preview dots */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {theme.videos.map((v) => (
                        <div
                          key={v.id}
                          className="w-2.5 h-2.5 rounded-full bg-neutral-700 group-hover:bg-white transition-colors"
                          title={`Slot 0${v.index}: ${v.title}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Theme →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Saved Videos View */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-white">Your Saved 5-Video Library</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {savedVideoIds.length} stream{savedVideoIds.length === 1 ? '' : 's'} bookmarked for instant playback.
                </p>
              </div>
              {savedVideoIds.length > 0 && (
                <button
                  onClick={() => setSavedVideoIds([])}
                  className="text-xs font-mono text-neutral-400 hover:text-red-400 transition-colors"
                >
                  Clear Library
                </button>
              )}
            </div>

            {savedVideoIds.length === 0 && (
              <div className="text-center py-16 rounded-2xl bg-[#0d0f17] border border-neutral-800 p-8">
                <Bookmark className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">No saved videos yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                  Click the bookmark icon on any 3D preview card to pin it to your personal matrix for quick offline-like return.
                </p>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="mt-4 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs"
                >
                  Explore 5-Video Matrix
                </button>
              </div>
            )}
          </div>
        )}

        {/* Videos Grid or Cinema Reel */}
        {(activeTab === 'feed' || activeTab === 'saved' || searchQuery) && (
          <div>
            {/* Search results header */}
            {searchQuery && (
              <div className="mb-4 text-xs font-mono text-neutral-400">
                Found {displayedVideos.length} stream{displayedVideos.length === 1 ? '' : 's'} matching "{searchQuery}"
              </div>
            )}

            {/* View Mode: 3D Perspective Grid */}
            {viewMode === '3d-grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedVideos.map((video, idx) => (
                  <VideoCard3D
                    key={video.id}
                    video={video}
                    themeTitle={activeTheme.title}
                    themeNumber={activeTheme.number}
                    onSelect={(v) => setActiveVideo(v)}
                    isSaved={savedVideoIds.includes(video.id)}
                    onToggleSave={toggleSaveVideo}
                    onShare={handleShareVideo}
                    priority={idx < 3}
                  />
                ))}
              </div>
            ) : (
              /* View Mode: Cinema Reel (Horizontal swipe/scroll) */
              <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x">
                {displayedVideos.map((video, idx) => (
                  <div key={video.id} className="min-w-[320px] sm:min-w-[420px] snap-center">
                    <VideoCard3D
                      video={video}
                      themeTitle={activeTheme.title}
                      themeNumber={activeTheme.number}
                      onSelect={(v) => setActiveVideo(v)}
                      isSaved={savedVideoIds.includes(video.id)}
                      onToggleSave={toggleSaveVideo}
                      onShare={handleShareVideo}
                      priority={idx < 2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state for search */}
        {displayedVideos.length === 0 && searchQuery && (
          <div className="text-center py-16 rounded-2xl bg-[#0d0f17] border border-neutral-800 p-8">
            <Search className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No streams found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Try searching for another keyword or clear the search to view all 5 videos in the active link theme.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs"
            >
              Reset Search
            </button>
          </div>
        )}
      </main>

      {/* Flagship Theater Player Modal */}
      {activeVideo && (
        <TheaterPlayer
          video={activeVideo}
          theme={themes.find((t) => t.id === activeVideo.themeId) || activeTheme}
          allThemes={themes}
          onClose={() => setActiveVideo(null)}
          onSelectVideo={(v) => setActiveVideo(v)}
          isSaved={savedVideoIds.includes(activeVideo.id)}
          onToggleSave={toggleSaveVideo}
          onShare={handleShareVideo}
        />
      )}

      {/* Custom 5-Video Theme Builder Modal */}
      {showCreateModal && (
        <CustomThemeModal
          onClose={() => setShowCreateModal(false)}
          onSaveTheme={handleSaveCustomTheme}
          existingVideos={allVideos}
        />
      )}

      {/* Mobile Ergonomic Bottom Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'create') {
            setShowCreateModal(true);
          } else if (tab === 'player') {
            if (!activeVideo) {
              setActiveVideo(activeTheme.videos[0]);
            }
          } else {
            setActiveTab(tab);
          }
        }}
        hasActiveVideo={Boolean(activeVideo)}
        savedCount={savedVideoIds.length}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 bg-[#050608] px-4 sm:px-8 py-6 text-center text-xs font-mono text-neutral-600">
        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-500 mb-2">
          <span>KURO TUBE · 5 VIDEOS PER LINK</span>
          <span aria-hidden="true">·</span>
          <span>SUB-20MS STREAM BUFFER</span>
          <span aria-hidden="true">·</span>
          <span>3D PERSPECTIVE PREVIEWS</span>
        </div>
        <p>© 2026 KURO TUBE. Minimalist high-definition futuristic video network.</p>
      </footer>
    </div>
  );
}
