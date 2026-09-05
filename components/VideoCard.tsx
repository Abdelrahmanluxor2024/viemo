'use client';

import React from 'react';
import Link from 'next/link';
import { Video } from '@/lib/types';
import { formatDuration, formatDate } from '@/lib/utils';
import { Play } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link 
      href={`/watch/${video.id}`}
      className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-xl"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-gray-200 transition-colors">
            <Play className="w-10 h-10 stroke-1" />
          </div>
        )}

        {/* Duration badge */}
        {video.duration > 0 && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-xs font-medium text-white bg-black/75 rounded backdrop-blur-xs">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{formatDate(video.created_at)}</span>
          {video.views !== undefined && (
            <>
              <span>•</span>
              <span>{video.views} مشاهدة</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
