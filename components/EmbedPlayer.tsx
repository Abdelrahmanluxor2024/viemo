'use client';

import React, { useEffect, useRef } from 'react';
import 'plyr/dist/plyr.css';

interface EmbedPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  start?: number;
  end?: number;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export default function EmbedPlayer({
  src,
  poster,
  title = 'Embedded Video',
  autoplay = false,
  start = 0,
  end,
  loop = false,
  muted = false,
  controls = true,
}: EmbedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPlyr() {
      if (!videoRef.current) return;

      const Plyr = (await import('plyr')).default;
      if (!isMounted || !videoRef.current) return;

      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }

      const controlsList = controls
        ? [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'pip',
            'fullscreen',
          ]
        : [];

      const player = new Plyr(videoRef.current, {
        controls: controlsList,
        settings: ['quality', 'speed'],
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 2],
        },
        quality: {
          default: 720,
          options: [360, 480, 720, 1080],
        },
        autoplay: autoplay,
        muted: muted,
        loop: { active: loop },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        i18n: {
          restart: 'إعادة التشغيل',
          rewind: 'إرجاع {seektime}ث',
          play: 'تشغيل',
          pause: 'إيقاف',
          fastForward: 'تقديم {seektime}ث',
          seek: 'تقديم وتأخير',
          currentTime: 'الوقت',
          duration: 'المدة',
          volume: 'الصوت',
          mute: 'كتم',
          unmute: 'تشغيل الصوت',
          enterFullscreen: 'ملء الشاشة',
          exitFullscreen: 'خروج',
          settings: 'الإعدادات',
          speed: 'السرعة',
          quality: 'الجودة',
        },
      });

      playerInstanceRef.current = player;

      player.on('ready', () => {
        if (muted) {
          player.muted = true;
        }

        if (start && start > 0) {
          player.currentTime = start;
        }

        if (autoplay) {
          player.muted = true; // ensure autoplay works across modern browsers
          const playPromise = player.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((err: any) => {
              console.warn('Autoplay prevented:', err);
            });
          }
        }
      });

      if (end && end > 0) {
        player.on('timeupdate', () => {
          if (player.currentTime >= end) {
            player.pause();
            if (loop) {
              player.currentTime = start || 0;
              player.play();
            }
          }
        });
      }
    }

    initPlyr();

    return () => {
      isMounted = false;
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [src, autoplay, start, end, loop, muted, controls]);

  return (
    <div className="embed-container w-screen h-screen bg-black overflow-hidden flex items-center justify-center m-0 p-0">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        crossOrigin="anonymous"
        poster={poster}
        data-poster={poster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
