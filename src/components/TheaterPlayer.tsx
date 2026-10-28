import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  SkipForward,
  SkipBack,
  Settings,
  X,
  Share2,
  Bookmark,
  Zap,
  Activity,
  ChevronDown,
  Repeat,
  Radio
} from 'lucide-react';
import { VideoItem, LinkTheme, PlaybackQuality } from '../types';
import { soundFX } from '../utils/audioSynthesizer';

interface TheaterPlayerProps {
  video: VideoItem;
  theme: LinkTheme;
  allThemes: LinkTheme[];
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
  isSaved?: boolean;
  onToggleSave?: (video: VideoItem) => void;
  onShare?: (video: VideoItem) => void;
}

export const TheaterPlayer: React.FC<TheaterPlayerProps> = ({
  video,
  theme,
  onClose,
  onSelectVideo,
  isSaved = false,
  onToggleSave,
  onShare
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(video.durationSeconds || 300);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [quality, setQuality] = useState<PlaybackQuality>('4K 60fps');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [bufferedSeconds, setBufferedSeconds] = useState<number>(12);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<number | null>(null);

  // Trigger brief toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Switch to next or previous video in the 5-video theme
  const handleNextInTheme = useCallback(() => {
    const nextIndex = video.index >= 5 ? 1 : video.index + 1;
    const nextVideo = theme.videos.find((v) => v.index === nextIndex) || theme.videos[0];
    soundFX.openStream();
    onSelectVideo(nextVideo);
    triggerToast(`Playing 0${nextIndex} of 05`);
  }, [video.index, theme.videos, onSelectVideo]);

  const handlePrevInTheme = useCallback(() => {
    const prevIndex = video.index <= 1 ? 5 : video.index - 1;
    const prevVideo = theme.videos.find((v) => v.index === prevIndex) || theme.videos[4];
    soundFX.openStream();
    onSelectVideo(prevVideo);
    triggerToast(`Playing 0${prevIndex} of 05`);
  }, [video.index, theme.videos, onSelectVideo]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    soundFX.click();
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
            triggerToast('+5s');
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            triggerToast('-5s');
          }
          break;
        case 'm':
        case 'M':
          setIsMuted((prev) => !prev);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'l':
        case 'L':
          setIsLooping((prev) => !prev);
          triggerToast(isLooping ? 'Loop Disabled' : 'Loop Enabled');
          break;
        case 'Escape':
          onClose();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5': {
          const targetIdx = parseInt(e.key, 10);
          const targetVid = theme.videos.find((v) => v.index === targetIdx);
          if (targetVid) {
            onSelectVideo(targetVid);
            triggerToast(`Jumped to 0${targetIdx} / 05`);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, isLooping, theme.videos, onSelectVideo, onClose]);

  // Video time updates and buffer calculations
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    
    // Check buffered amount
    if (videoRef.current.buffered.length > 0) {
      try {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const ahead = Math.max(0, bufferedEnd - videoRef.current.currentTime);
        setBufferedSeconds(Number(ahead.toFixed(1)));
      } catch {
        // Safe buffer check
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.durationSeconds);
      videoRef.current.playbackRate = speed;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Video ended handling -> Binge next in 5-video theme
  const handleVideoEnded = () => {
    if (isLooping) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else if (autoPlayNext) {
      handleNextInTheme();
    } else {
      setIsPlaying(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Scrub Timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Auto-hide controls when idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 3200);
  };

  // Speed changer
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
    setShowSettings(false);
    triggerToast(`${newSpeed}x Speed`);
  };

  // Audio Equalizer Visualizer on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 18;
      const barWidth = 3;
      const spacing = 2;

      for (let i = 0; i < bars; i++) {
        // Synthesize dynamic reactive height based on play state and time
        const dynamicVal = isPlaying && !isMuted
          ? Math.sin(phase + i * 0.4) * 0.5 + Math.cos(phase * 1.5 + i * 0.2) * 0.4 + 0.6
          : 0.15;
        const barHeight = Math.max(3, dynamicVal * (canvas.height - 4));
        const x = i * (barWidth + spacing);
        const y = canvas.height - barHeight;

        ctx.fillStyle = isPlaying && !isMuted ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      phase += 0.12;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isMuted]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl overflow-y-auto no-scrollbar animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation Contract */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800/80 bg-[#07080c]/90 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
            title="Close Player (Esc)"
            aria-label="Close Player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <span>{theme.number}</span>
              <span>·</span>
              <span className="truncate max-w-[200px] sm:max-w-md">{theme.title}</span>
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-[250px] sm:max-w-xl">
              {video.title}
            </h2>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Telemetry Switch */}
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
              showTelemetry
                ? 'bg-neutral-800 text-emerald-400 border-neutral-700'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Low Latency HUD</span>
          </button>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(video)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save for later'}
              aria-label={isSaved ? 'Remove from Saved' : 'Save for later'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          {onShare && (
            <button
              onClick={() => onShare(video)}
              className="p-2 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800 hover:text-white transition-colors"
              title="Share Video"
              aria-label="Share Video"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors ml-1"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport Player Container */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-6 py-4 flex-1 flex flex-col">
        {/* Video Canvas Stage */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800/80 shadow-2xl flex items-center justify-center group ${
            isTheaterExpanded ? 'max-h-[75vh]' : 'max-h-[50vh]'
          }`}
        >
          {/* HTML5 Native Video Engine */}
          <video
            ref={videoRef}
            src={video.streamUrl}
            poster={video.posterUrl}
            playsInline
            loop={isLooping}
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Holographic Scanline Overlay */}
          <div className="scanlines-overlay absolute inset-0 opacity-20 pointer-events-none" />

          {/* Real-time Telemetry HUD (Low latency verification) */}
          {showTelemetry && (
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
              <div className="bg-black/85 backdrop-blur-md border border-neutral-800 p-2.5 rounded-xl font-mono text-[11px] text-neutral-300 space-y-1 shadow-lg max-w-[240px]">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>LATENCY</span>
                  <span className="text-emerald-400 font-semibold">{video.latencyMs}ms</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>BUFFERED</span>
                  <span className="text-white">{bufferedSeconds}s ahead</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>BITRATE</span>
                  <span className="text-white">{video.bitrate}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>RESOLUTION</span>
                  <span className="text-white">{quality}</span>
                </div>
              </div>
            </div>
          )}

          {/* Equalizer Visualizer Top-Right */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-mono text-neutral-400">SONIC HUD</span>
            <canvas ref={canvasRef} width={80} height={16} className="w-16 h-3" />
          </div>

          {/* Center Play Indicator on Pause */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-transform hover:scale-110 active:scale-95"
              aria-label="Play video"
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-1" />
            </button>
          )}

          {/* Floating HUD Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Timeline Scrub Bar */}
            <div
              onClick={handleSeek}
              onTouchMove={handleSeek}
              className="relative w-full h-3 hover:h-4.5 cursor-pointer flex items-center mb-3 group/timeline transition-all duration-150"
            >
              {/* Background Track */}
              <div className="w-full h-1.5 group-hover/timeline:h-2.5 rounded-full bg-neutral-800 overflow-hidden relative transition-all">
                {/* Buffered Progress */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-neutral-600/60 rounded-full"
                  style={{
                    width: `${Math.min(100, ((currentTime + bufferedSeconds) / (duration || 1)) * 100)}%`,
                  }}
                />
                {/* Played Progress */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-75"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>

              {/* Scrubber Playhead Handle */}
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/timeline:opacity-100 transition-opacity -translate-x-1/2"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between text-white">
              {/* Left Group: Play/Pause, Skip Prev/Next in Theme, Volume, Time */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={handlePrevInTheme}
                  className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  title="Previous in Theme"
                  aria-label="Previous in Theme"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={handleNextInTheme}
                  className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  title="Next in Theme"
                  aria-label="Next in Theme"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                {/* Volume slider & mute */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      setIsMuted(val === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = val;
                      }
                    }}
                    className="w-14 sm:w-20 h-1 bg-neutral-700 accent-white rounded-lg cursor-pointer"
                    aria-label="Volume slider"
                  />
                </div>

                {/* Time Display */}
                <div className="text-xs font-mono text-neutral-400">
                  <span className="text-white">{formatTime(currentTime)}</span>
                  <span className="mx-1 text-neutral-600">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Group: Binge Autoplay, Speed, Quality, Loop, Fullscreen */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* 5-Video Binge Switcher */}
                <button
                  onClick={() => {
                    setAutoPlayNext(!autoPlayNext);
                    triggerToast(autoPlayNext ? 'Autoplay: Off' : 'Autoplay 5-Set: On');
                  }}
                  className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                    autoPlayNext
                      ? 'bg-neutral-800 text-white border-neutral-700'
                      : 'bg-transparent text-neutral-500 border-neutral-800'
                  }`}
                  title="Binge Mode: Automatically play next of the 5 videos in this theme"
                >
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>5-Binge</span>
                </button>

                {/* Loop */}
                <button
                  onClick={() => {
                    setIsLooping(!isLooping);
                    triggerToast(isLooping ? 'Loop Off' : 'Loop On');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isLooping ? 'text-emerald-400 bg-white/10' : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Loop Current Video (L)"
                  aria-label="Loop Current Video"
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Settings Menu Popup */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Playback Settings"
                    aria-label="Playback Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {showSettings && (
                    <div className="absolute right-0 bottom-12 z-50 w-48 rounded-xl bg-neutral-900/95 border border-neutral-800 p-2 shadow-2xl backdrop-blur-xl font-mono text-xs text-neutral-300">
                      <div className="px-2 py-1 text-[10px] text-neutral-500 uppercase tracking-wider">Speed</div>
                      <div className="grid grid-cols-4 gap-1 p-1">
                        {[0.75, 1, 1.25, 1.5].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`py-1 rounded text-center transition-colors ${
                              speed === s ? 'bg-white text-black font-semibold' : 'hover:bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>

                      <div className="px-2 pt-2 py-1 text-[10px] text-neutral-500 uppercase tracking-wider border-t border-neutral-800 mt-1">
                        Resolution
                      </div>
                      <div className="space-y-0.5">
                        {(['4K 60fps', '1080p 60fps', '720p Low-Latency'] as PlaybackQuality[]).map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q);
                              setShowSettings(false);
                              triggerToast(`Switched to ${q}`);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                              quality === q ? 'bg-neutral-800 text-white font-semibold' : 'hover:bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Fullscreen (F)"
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Video Theme Interactive Matrix Carousel below Player */}
        <div className="mt-6 border-t border-neutral-800/80 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                Active Theme Playlist ({theme.number})
              </span>
              <h3 className="text-base font-semibold text-white">{theme.title}</h3>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Playing <span className="text-white font-semibold">0{video.index}</span> of 05
            </div>
          </div>

          {/* 5-Video Horizontal Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {theme.videos.map((v) => {
              const isActive = v.id === video.id;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    soundFX.openStream();
                    onSelectVideo(v);
                  }}
                  className={`group relative rounded-xl border p-2 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-neutral-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white'
                      : 'bg-[#0d0f17]/80 border-neutral-800/80 hover:border-neutral-600 hover:bg-neutral-900'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950">
                    <img
                      src={v.posterUrl}
                      alt={v.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">
                      0{v.index}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                          <Play className="w-3 h-3 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 px-1 rounded bg-black/80 font-mono text-[10px] text-neutral-300">
                      {v.duration}
                    </div>
                  </div>

                  {/* Title */}
                  <p className="mt-2 text-xs font-medium text-neutral-200 line-clamp-1 group-hover:text-white">
                    {v.title}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 truncate">{v.creator}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Description & Creator Details */}
        <div className="mt-6 p-4 rounded-xl bg-[#0d0f17] border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white">{video.title}</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">{video.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-neutral-400">
            <span>{video.bitrate}</span>
            <span aria-hidden="true">·</span>
            <span>{video.views} plays</span>
          </div>
        </div>
      </div>
    </div>
  );
};
