export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number;
  quality_options: string[] | null;
  user_id: string | null;
  views?: number;
  created_at: string;
}

export interface EmbedOptions {
  width: string;
  aspectRatio: '16/9' | '4/3';
  autoplay: boolean;
  startTime: number;
  endTime?: number;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}
