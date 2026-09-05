'use client';

import React, { useEffect, useRef } from 'react';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  startTime?: number;
  qualityOptions?: string[];
}

export default function VideoPlayer({
  src,
  poster,
  title = 'Video Player',
  autoplay = false,
  startTime = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPlyr() {
      if (!videoRef.current) return;

      const Plyr = (await import('plyr')).default;
      if (!isMounted || !videoRef.current) return;

      // Destroy any existing instance
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }

      const player = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'fullscreen',
        ],
        settings: ['quality', 'speed', 'captions'],
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 2],
        },
        quality: {
          default: 720,
          options: [360, 480, 720, 1080],
        },
        autoplay: autoplay,
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        i18n: {
          restart: 'إعادة التشغيل',
          rewind: 'إرجاع {seektime} ثواني',
          play: 'تشغيل',
          pause: 'إيقاف مؤقت',
          fastForward: 'تقديم {seektime} ثواني',
          seek: 'تقديم وتأخير',
          seekLabel: '{currentTime} من {duration}',
          played: 'تم التشغيل',
          buffered: 'تم التحميل',
          currentTime: 'الوقت الحالي',
          duration: 'المدة الإجمالية',
          volume: 'مستوى الصوت',
          mute: 'كتم الصوت',
          unmute: 'إلغاء الكتم',
          enableCaptions: 'تفعيل الترجمة',
          disableCaptions: 'إلغاء الترجمة',
          download: 'تنزيل',
          enterFullscreen: 'شاشة كاملة',
          exitFullscreen: 'خروج من الشاشة الكاملة',
          frameTitle: 'مشغل {title}',
          captions: 'الترجمة',
          settings: 'الإعدادات',
          pip: 'صورة داخل صورة',
          speed: 'السرعة',
          quality: 'الجودة',
          loop: 'تكرار',
          start: 'البداية',
          end: 'النهاية',
          all: 'الكل',
          reset: 'إعادة الضبط',
          disabled: 'معطل',
          enabled: 'مفعل',
          advertisement: 'إعلان',
          qualityBadge: {
            2160: '4K',
            1440: 'HD',
            1080: 'HD',
            720: 'HD',
            576: 'SD',
            480: 'SD',
          },
        },
      });

      playerInstanceRef.current = player;

      player.on('ready', () => {
        if (startTime && startTime > 0) {
          player.currentTime = startTime;
        }
        if (autoplay) {
          const playPromise = player.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              // Browsers may block unmuted autoplay; try muted
              player.muted = true;
              player.play();
            });
          }
        }
      });
    }

    initPlyr();

    return () => {
      isMounted = false;
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [src, autoplay, startTime]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
      <video
        ref={videoRef}
        className="plyr-react plyr"
        playsInline
        crossOrigin="anonymous"
        poster={poster}
        data-poster={poster}
      >
        <source src={src} type="video/mp4" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
    </div>
  );
}
