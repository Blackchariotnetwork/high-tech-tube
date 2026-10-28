import React, { useState, useRef, useEffect } from 'react';
import { Play, Bookmark, Share2, Eye, Zap, Volume2, VolumeX } from 'lucide-react';
import { VideoItem } from '../types';
import { soundFX } from '../utils/audioSynthesizer';

interface VideoCard3DProps {
  video: VideoItem;
  themeTitle: string;
  themeNumber: string;
  onSelect: (video: VideoItem) => void;
  isSaved?: boolean;
  onToggleSave?: (video: VideoItem) => void;
  onShare?: (video: VideoItem) => void;
  priority?: boolean;
}

export const VideoCard3D: React.FC<VideoCard3DProps> = ({
  video,
  themeTitle,
  themeNumber,
  onSelect,
  isSaved = false,
  onToggleSave,
  onShare,
  priority = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [previewLoaded, setPreviewLoaded] = useState<boolean>(false);
  const [previewMuted, setPreviewMuted] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubPercent, setScrubPercent] = useState<number>(0);

  // Handle 3D Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = x / rect.width;
    const yPct = y / rect.height;

    // Calculate rotation (-14deg to +14deg for high responsiveness without nausea)
    const rY = (xPct - 0.5) * 24;
    const rX = -(yPct - 0.5) * 20;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: xPct * 100,
      y: yPct * 100,
      opacity: 0.6
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundFX.hover();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented or video not yet ready
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsScrubbing(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Mobile Touch Support with 3D Gyro/Tilt Simulation
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const xPct = x / rect.width;
      const yPct = y / rect.height;
      setRotateX(-(yPct - 0.5) * 18);
      setRotateY((xPct - 0.5) * 18);
      setGlarePos({ x: xPct * 100, y: yPct * 100, opacity: 0.4 });
    }
  };

  const handleTouchEnd = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  // Scrub preview timeline
  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    setScrubPercent(pct * 100);
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = pct * videoRef.current.duration;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        soundFX.openStream();
        onSelect(video);
      }}
      className="group relative cursor-pointer select-none perspective-container transition-transform duration-200 ease-out"
      style={{ minHeight: '340px' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          soundFX.openStream();
          onSelect(video);
        }
      }}
      aria-label={`Play ${video.title}, video ${video.index} of 5 in ${themeTitle}`}
    >
      {/* 3D Wrapper */}
      <div
        className="preserve-3d relative w-full h-full rounded-2xl bg-[#0d0f17]/90 border border-neutral-800/80 p-3.5 transition-all duration-300 ease-out hover:border-neutral-500/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9),0_0_25px_rgba(255,255,255,0.06)]"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        }}
      >
        {/* Dynamic Specular Holographic Glare */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-30"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 350px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.02) 40%, transparent 80%)`,
          }}
        />

        {/* Video Canvas Container (Depth Layer 1) */}
        <div
          className="preserve-3d relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/60 transition-transform duration-300"
          style={{ transform: 'translateZ(12px)' }}
        >
          {/* Static Poster Image */}
          <img
            src={video.posterUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            loading={priority ? 'eager' : 'lazy'}
            className={`w-full h-full object-cover transition-opacity duration-400 ${
              isHovered && previewLoaded ? 'opacity-0' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700'
            }`}
          />

          {/* Live Video Preview (Low latency instant playback) */}
          <video
            ref={videoRef}
            src={video.streamUrl}
            preload="metadata"
            muted={previewMuted}
            loop
            playsInline
            onLoadedData={() => setPreviewLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Holographic Scanline Layer on hover */}
          <div className="scanlines-overlay absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

          {/* Gradient Scrim for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

          {/* Floating Index Pill / Tag (Depth Layer 3 - translateZ 30px) */}
          <div
            className="preserve-3d absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-neutral-700/60 text-xs font-mono text-neutral-200 transition-transform duration-300"
            style={{ transform: 'translateZ(26px)' }}
          >
            <span className="text-white font-semibold">{String(video.index).padStart(2, '0')}</span>
            <span className="text-neutral-500">/ 05</span>
          </div>

          {/* Resolution Badge & Latency (Depth Layer 3) */}
          <div
            className="preserve-3d absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-neutral-700/60 text-[11px] font-mono text-neutral-300"
            style={{ transform: 'translateZ(26px)' }}
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{video.latencyMs}ms</span>
          </div>

          {/* Center 3D Holographic Play Button (Depth Layer 4 - translateZ 40px) */}
          <div
            className="preserve-3d absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
            style={{ transform: 'translateZ(38px)' }}
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? 'bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.7)]'
                  : 'bg-white/20 backdrop-blur-md text-white border border-white/30 scale-95 opacity-80'
              }`}
            >
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            </div>
          </div>

          {/* Live Preview Sound Toggle (When hovered) */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewMuted(!previewMuted);
              }}
              className="absolute bottom-9 right-3 z-30 p-1.5 rounded-full bg-black/80 hover:bg-black text-neutral-200 border border-neutral-700 backdrop-blur-md transition-colors"
              title={previewMuted ? 'Unmute preview' : 'Mute preview'}
              aria-label={previewMuted ? 'Unmute preview' : 'Mute preview'}
            >
              {previewMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          )}

          {/* Timeline Scrub Track (Depth Layer 2) */}
          <div
            onClick={handleTimelineScrub}
            className="absolute bottom-0 left-0 right-0 h-2 bg-neutral-900/80 hover:h-3 transition-all duration-150 cursor-pointer z-20 group/scrub"
          >
            <div
              className="h-full bg-gradient-to-r from-neutral-300 to-white transition-all duration-100 relative"
              style={{ width: `${isScrubbing ? scrubPercent : 35}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover/scrub:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 left-3 text-[11px] font-mono text-neutral-300 font-medium tracking-tight">
            <span>{video.duration}</span>
            <span className="mx-1 text-neutral-500">·</span>
            <span className="text-neutral-400">{video.resolution.split('·')[0].trim()}</span>
          </div>
        </div>

        {/* Video Metadata Block (Depth Layer 2) */}
        <div
          className="preserve-3d mt-3 px-1 transition-transform duration-300"
          style={{ transform: 'translateZ(16px)' }}
        >
          {/* Creator & Link Theme Unboxed Text */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1 font-mono">
            <span className="truncate max-w-[200px]">{video.creator}</span>
            <span className="shrink-0 text-neutral-500">{video.bitrate}</span>
          </div>

          {/* Video Title */}
          <h3 className="text-base font-semibold text-neutral-100 line-clamp-1 group-hover:text-white transition-colors">
            {video.title}
          </h3>

          {/* Video Description snippet */}
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {video.description}
          </p>

          {/* Card Footer: Unboxed Metrics & Quick Actions */}
          <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
            {/* Unboxed Metadata (Zero-Pill discipline) */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-neutral-500" />
                <span>{video.views}</span>
              </span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-400">{video.publishedDate}</span>
            </div>

            {/* Quick Micro Actions */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {onToggleSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.click();
                    onToggleSave(video);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isSaved
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save for later'}
                  aria-label={isSaved ? 'Remove from Saved' : 'Save for later'}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.click();
                    onShare(video);
                  }}
                  className="p-1.5 rounded-lg bg-neutral-900/80 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors"
                  title="Share 5-video link"
                  aria-label="Share 5-video link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
