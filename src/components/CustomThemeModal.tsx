import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Check, Link as LinkIcon, Film } from 'lucide-react';
import { LinkTheme, VideoItem } from '../types';
import { soundFX } from '../utils/audioSynthesizer';
import { USER_LOGO_PATH } from '../data/videoThemes';

interface CustomThemeModalProps {
  onClose: () => void;
  onSaveTheme: (newTheme: LinkTheme) => void;
  existingVideos: VideoItem[];
}

export const CustomThemeModal: React.FC<CustomThemeModalProps> = ({
  onClose,
  onSaveTheme,
  existingVideos,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Exactly 5 video slots
  const [slotVideos, setSlotVideos] = useState<Array<Partial<VideoItem>>>([
    {
      title: 'Neon Synapse: Protocol Zero',
      creator: 'Quantum Unit',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80',
      duration: '04:12',
      durationSeconds: 252,
      resolution: '4K UHD · 60fps',
      bitrate: '24.0 Mbps',
      latencyMs: 16,
    },
    {
      title: 'Sub-Zero Cryo Chamber Stream',
      creator: 'Chiba Cryo Lab',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
      duration: '05:30',
      durationSeconds: 330,
      resolution: '1440p · 60fps',
      bitrate: '20.5 Mbps',
      latencyMs: 19,
    },
    {
      title: 'Orbital Speed Horizon',
      creator: 'Aero Dynamics',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80',
      duration: '06:14',
      durationSeconds: 374,
      resolution: '4K HDR · 60fps',
      bitrate: '26.8 Mbps',
      latencyMs: 15,
    },
    {
      title: 'Deep Acoustic Feedback Matrix',
      creator: 'Modular Audio Unit',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
      duration: '03:45',
      durationSeconds: 225,
      resolution: '4K UHD · 60fps',
      bitrate: '22.1 Mbps',
      latencyMs: 17,
    },
    {
      title: 'Event Horizon Relativistic Render',
      creator: 'Singularity Lab',
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
      duration: '07:20',
      durationSeconds: 440,
      resolution: '4K UHD · 60fps',
      bitrate: '28.0 Mbps',
      latencyMs: 18,
    },
  ]);

  const updateSlot = (index: number, key: keyof VideoItem, value: any) => {
    const updated = [...slotVideos];
    updated[index] = { ...updated[index], [key]: value };
    setSlotVideos(updated);
  };

  const handlePickExisting = (slotIdx: number, vid: VideoItem) => {
    const updated = [...slotVideos];
    updated[slotIdx] = {
      title: vid.title,
      creator: vid.creator,
      streamUrl: vid.streamUrl,
      posterUrl: vid.posterUrl,
      duration: vid.duration,
      durationSeconds: vid.durationSeconds,
      resolution: vid.resolution,
      bitrate: vid.bitrate,
      latencyMs: vid.latencyMs,
    };
    setSlotVideos(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const themeId = `custom-theme-${Date.now()}`;
    const builtVideos: VideoItem[] = slotVideos.map((v, i) => ({
      id: `${themeId}-v${i + 1}`,
      themeId,
      index: i + 1,
      title: v.title || `Video 0${i + 1}`,
      creator: v.creator || 'Custom Curator',
      creatorAvatar: USER_LOGO_PATH,
      duration: v.duration || '04:00',
      durationSeconds: v.durationSeconds || 240,
      resolution: v.resolution || '4K UHD · 60fps',
      streamUrl: v.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      posterUrl: v.posterUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80',
      description: `Curated track 0${i + 1} inside ${title}. Low latency 60fps stream.`,
      bitrate: v.bitrate || '24.0 Mbps',
      latencyMs: v.latencyMs || 18,
      views: '1',
      likes: 1,
      publishedDate: 'Just now',
    }));

    const newTheme: LinkTheme = {
      id: themeId,
      number: '★',
      title: title.toUpperCase(),
      subtitle: subtitle || 'Custom User 5-Video Matrix',
      description: description || 'User-curated 5-video link stream cluster.',
      accentColor: '#38bdf8',
      coverImage: builtVideos[0].posterUrl,
      videos: builtVideos,
      isCustom: true,
    };

    soundFX.openStream();
    onSaveTheme(newTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto no-scrollbar">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0d0f17] border border-neutral-800 p-5 sm:p-7 shadow-2xl my-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              Curation Studio
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Create 5-Video Link Theme
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Theme Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                THEME TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DARK SYNTH // 07"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-white focus:outline-none text-white text-sm font-mono placeholder:text-neutral-600"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                SUBTITLE / VIBE
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Midnight neon drifting and sub-bass"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-white focus:outline-none text-white text-sm font-mono placeholder:text-neutral-600"
              />
            </div>
          </div>

          {/* 5 Video Slots Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXACTLY 5 CURATED VIDEOS IN SET</span>
              </label>
              <span className="text-[11px] font-mono text-neutral-500">5 / 5 Configured</span>
            </div>

            <div className="space-y-2.5 max-h-[42vh] overflow-y-auto no-scrollbar pr-1">
              {slotVideos.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">Slot 0{idx + 1} of 05</span>
                    {/* Quick populate from existing */}
                    <select
                      onChange={(e) => {
                        const vid = existingVideos.find((v) => v.id === e.target.value);
                        if (vid) handlePickExisting(idx, vid);
                      }}
                      className="bg-neutral-800 text-neutral-300 text-[11px] rounded px-2 py-1 border border-neutral-700 max-w-[200px] truncate"
                    >
                      <option value="">Choose from library...</option>
                      {existingVideos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder={`Video 0${idx + 1} Title`}
                      value={slot.title || ''}
                      onChange={(e) => updateSlot(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-neutral-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Creator Name"
                      value={slot.creator || ''}
                      onChange={(e) => updateSlot(idx, 'creator', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-neutral-600 focus:outline-none"
                    />
                  </div>

                  <input
                    type="url"
                    required
                    placeholder="Direct MP4 / Stream URL"
                    value={slot.streamUrl || ''}
                    onChange={(e) => updateSlot(idx, 'streamUrl', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-neutral-600 focus:outline-none text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs font-mono hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Launch 5-Video Theme</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
