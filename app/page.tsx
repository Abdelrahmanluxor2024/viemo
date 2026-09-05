'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Video } from '@/lib/types';
import VideoCard from '@/components/VideoCard';
import { Search, Upload, Play, Sparkles } from 'lucide-react';

// Fallback high-quality open-source demo videos if database has not yet been seeded
const DEMO_VIDEOS: Video[] = [
  {
    id: 'demo-big-buck-bunny',
    title: 'Big Buck Bunny - فيلم رسوم متحركة مفتوح المصدر بدقة عالية',
    description: 'عرض توضيحي لمشغل Plyr الفائق الخفة وجودة العرض 1080p.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    duration: 596,
    quality_options: ['1080p', '720p', '480p', '360p'],
    user_id: null,
    views: 1240,
    created_at: new Date().toISOString(),
  },
  {
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
  {
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
];

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          // If Supabase table is empty or pending schema creation, show demo videos so user can test immediately
          setVideos(DEMO_VIDEOS);
        } else {
          setVideos(data);
        }
      } catch (err) {
        console.warn('Falling back to demo videos:', err);
        setVideos(DEMO_VIDEOS);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero / Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            فيديوهات Viemo
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            مشغل فائق الخفة، وتضمين فوري في أي موقع بدون إعلانات أو تعقيد.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن فيديو..."
            className="w-full pl-3 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-video bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xs text-gray-400">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">لا توجد نتائج مطابقة</h3>
          <p className="text-sm text-gray-600 mb-4">جرب البحث بكلمات أخرى أو ارفع فيديو جديد الآن.</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>رفع فيديو الآن</span>
          </Link>
        </div>
      )}
    </div>
  );
}
