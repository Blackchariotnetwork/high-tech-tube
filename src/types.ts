export interface VideoItem {
  id: string;
  themeId: string;
  index: number; // strictly 1 to 5
  title: string;
  creator: string;
  creatorAvatar?: string;
  duration: string;
  durationSeconds: number;
  resolution: string;
  streamUrl: string;
  posterUrl: string;
  description: string;
  bitrate: string;
  latencyMs: number;
  views: string;
  likes: number;
  publishedDate: string;
}

export interface LinkTheme {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  coverImage: string;
  videos: VideoItem[]; // exactly 5 videos
  isCustom?: boolean;
}

export type PlaybackQuality = '4K 60fps' | '1080p 60fps' | '720p Low-Latency';
export type ViewMode = '3d-grid' | 'cinema-reel' | 'compact-list';
export type NavTab = 'feed' | 'themes' | 'player' | 'saved' | 'create';
