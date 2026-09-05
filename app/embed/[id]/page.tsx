'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Video } from '@/lib/types';
import EmbedPlayer from '@/components/EmbedPlayer';

// Demo fallback video list
const DEMO_VIDEOS: Record<string, Video> = {
  'demo-big-buck-bunny': {
    id: 'demo-big-buck-bunny',
    title: 'Big Buck Bunny',
    description: '',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    duration: 596,
    quality_options: ['1080p', '720p', '480p', '360p'],
    user_id: null,
    views: 1240,
    created_at: new Date().toISOString(),
  },
  'demo-elephants-dream': {
    id: 'demo-elephants-dream',
    title: 'Elephant\'s Dream',
    description: '',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    duration: 653,
    quality_options: ['1080p', '720p', '480p', '360p'],
    user_id: null,
    views: 890,
    created_at: new Date().toISOString(),
  },
  'demo-for-bigger-blazes': {
    id: 'demo-for-bigger-blazes',
    title: 'For Bigger Blazes',
    description: '',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80',
    duration: 15,
    quality_options: ['1080p', '720p'],
    user_id: null,
    views: 450,
    created_at: new Date().toISOString(),
  }
};

export default function EmbedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = (params?.id as string) || '';

  // Parse URL parameters
  const autoplay = searchParams.get('autoplay') === '1' || searchParams.get('autoplay') === 'true';
  const start = Number(searchParams.get('start')) || Number(searchParams.get('t')) || 0;
  const end = Number(searchParams.get('end')) || undefined;
  const loop = searchParams.get('loop') === '1' || searchParams.get('loop') === 'true';
  const muted = searchParams.get('muted') === '1' || searchParams.get('muted') === 'true';
  const controls = searchParams.get('controls') !== '0' && searchParams.get('controls') !== 'false';

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      if (!videoId) return;

      if (DEMO_VIDEOS[videoId]) {
        setVideo(DEMO_VIDEOS[videoId]);
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (dbError || !data) {
          // If video isn't found in DB, fallback to demo if testing
          if (DEMO_VIDEOS['demo-big-buck-bunny']) {
            setVideo({
              ...DEMO_VIDEOS['demo-big-buck-bunny'],
              id: videoId,
            });
          } else {
            setError(true);
          }
        } else {
          setVideo(data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white/70 text-sm font-sans p-4 text-center">
        <span>الفيديو غير متوفر أو تم حذفه</span>
      </div>
    );
  }

  return (
    <EmbedPlayer
      src={video.url}
      poster={video.thumbnail || undefined}
      title={video.title}
      autoplay={autoplay}
      start={start}
      end={end}
      loop={loop}
      muted={muted}
      controls={controls}
    />
  );
}
