'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Video } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import VideoPlayer from '@/components/VideoPlayer';
import EmbedModal from '@/components/EmbedModal';
import { Share2, ArrowRight, Eye, Calendar, Film } from 'lucide-react';
import Link from 'next/link';

// Demo fallback list
const DEMO_VIDEOS: Record<string, Video> = {
  'demo-big-buck-bunny': {
    id: 'demo-big-buck-bunny',
    title: 'Big Buck Bunny - فيلم رسوم متحركة مفتوح المصدر بدقة عالية',
    description: 'عرض توضيحي لمشغل Plyr الفائق الخفة وجودة العرض 1080p. تجربة تشغيل نقية بدون إعلانات وتضمين في أي موقع بنقرة واحدة.',
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
    title: 'Elephant\'s Dream - رحلة الخيال العلمي والجرافيك ثلاثي الأبعاد',
    description: 'فيديو تجريبي لاختبار التضمين، الأبعاد 16:9، وسرعة التحميل السلسة.',
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
    title: 'For Bigger Blazes - ألوان طبيعية وتجربة حركة سريعة',
    description: 'اختبار دقة التجاوب والمشغل داخل iframes والتنقل السريع.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80',
    duration: 15,
    quality_options: ['1080p', '720p'],
    user_id: null,
    views: 450,
    created_at: new Date().toISOString(),
  }
};

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = (params?.id as string) || '';
  const startTime = Number(searchParams?.get('t')) || 0;

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      if (!videoId) return;

      // 1. Check demo list
      if (DEMO_VIDEOS[videoId]) {
        setVideo(DEMO_VIDEOS[videoId]);
        setLoading(false);
        return;
      }

      // 2. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        if (error || !data) {
          // If not found in DB, check fallback or show error
          if (DEMO_VIDEOS['demo-big-buck-bunny']) {
            setVideo({
              ...DEMO_VIDEOS['demo-big-buck-bunny'],
              id: videoId,
              title: `فيديو ${videoId}`,
            });
          }
        } else {
          setVideo(data);

          // Increment view count
          try {
            await supabase.rpc('increment_video_views', { video_id: videoId });
          } catch {
            // Ignore RPC failure if function not yet applied in sql
          }
        }
      } catch (err) {
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="h-6 bg-gray-100 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">الفيديو غير متوفر</h2>
        <p className="text-sm text-gray-600 mb-6">قد يكون تم حذف الفيديو أو أن الرابط غير صحيح.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>الرجوع إلى جميع الفيديوهات</span>
        </Link>
      </div>

      {/* Plyr Video Player */}
      <div className="mb-6">
        <VideoPlayer
          src={video.url}
          poster={video.thumbnail || undefined}
          title={video.title}
          startTime={startTime}
          qualityOptions={video.quality_options || ['1080p', '720p', '480p', '360p']}
        />
      </div>

      {/* Video Details & Share Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {video.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(video.created_at)}</span>
              </span>
              {video.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{video.views} مشاهدة</span>
                </span>
              )}
            </div>
          </div>

          {/* Share / Embed Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-xs shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة وتضمين</span>
          </button>
        </div>

        {/* Description */}
        {video.description && (
          <div className="mt-4 pt-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              حول الفيديو
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {video.description}
            </p>
          </div>
        )}
      </div>

      {/* Share & Embed Modal */}
      <EmbedModal
        videoId={video.id}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
