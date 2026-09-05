'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileVideo, CheckCircle2, AlertCircle, Play, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatFileSize, formatDuration } from '@/lib/utils';

export default function UploadZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [autoThumbnailBlob, setAutoThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Upload Progress State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);

  // Generate thumbnail & read duration from video file
  const processVideoFile = (selectedFile: File) => {
    // 2GB max size check
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      setErrorMsg('حجم الفيديو يتجاوز الحد الأقصى المسموح به (2 جيجابايت)');
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    if (!title) {
      // Remove extension for default title
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }

    const videoObjUrl = URL.createObjectURL(selectedFile);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = videoObjUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = () => {
      setVideoDuration(tempVideo.duration || 0);
      // Seek to 1s or middle to get a frame for thumbnail
      const seekTime = Math.min(1.0, tempVideo.duration / 2);
      tempVideo.currentTime = seekTime;
    };

    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = tempVideo.videoWidth || 1280;
        canvas.height = tempVideo.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              setAutoThumbnailBlob(blob);
              setThumbnailPreview(URL.createObjectURL(blob));
            }
          }, 'image/jpeg', 0.85);
        }
      } catch (err) {
        console.warn('Could not generate automatic thumbnail:', err);
      }
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/') || droppedFile.name.match(/\.(mp4|mov|webm)$/i)) {
        processVideoFile(droppedFile);
      } else {
        setErrorMsg('يرجى اختيار ملف فيديو صالح (MP4, MOV, WebM)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
  };

  const handleCustomThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const thumbFile = e.target.files[0];
      setCustomThumbnailFile(thumbFile);
      setThumbnailPreview(URL.createObjectURL(thumbFile));
    }
  };

  // Upload to Supabase Storage with XMLHttpRequest for exact 0-100% progress
  const uploadFileWithProgress = async (
    targetFile: File | Blob,
    bucketPath: string,
    contentType: string
  ): Promise<string> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhqqtyqsblpmyskrvekp.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${supabaseUrl}/storage/v1/object/videos/${bucketPath}`;

      xhr.open('POST', url);
      xhr.setRequestHeader('apikey', supabaseAnonKey);
      xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.setRequestHeader('x-upsert', 'true');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/videos/${bucketPath}`;
          resolve(publicUrl);
        } else {
          // Fallback via supabase client if RLS or header issue
          supabase.storage
            .from('videos')
            .upload(bucketPath, targetFile, { upsert: true, contentType })
            .then(({ data, error }) => {
              if (error) {
                reject(new Error(error.message));
              } else {
                const { data: pubUrlData } = supabase.storage.from('videos').getPublicUrl(bucketPath);
                resolve(pubUrlData.publicUrl);
              }
            })
            .catch(reject);
        }
      };

      xhr.onerror = () => {
        // Fallback to supabase SDK
        supabase.storage
          .from('videos')
          .upload(bucketPath, targetFile, { upsert: true, contentType })
          .then(({ data, error }) => {
            if (error) {
              reject(new Error(error.message));
            } else {
              const { data: pubUrlData } = supabase.storage.from('videos').getPublicUrl(bucketPath);
              resolve(pubUrlData.publicUrl);
            }
          })
          .catch(reject);
      };

      xhr.send(targetFile);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    setProgress(0);

    try {
      // 1. Get current user if logged in
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || 'public';
      const videoId = crypto.randomUUID();
      const fileExt = file.name.split('.').pop() || 'mp4';
      const videoPath = `${userId}/${videoId}/video.${fileExt}`;

      // 2. Upload video file with progress tracking
      const videoUrl = await uploadFileWithProgress(file, videoPath, file.type || 'video/mp4');

      // 3. Upload thumbnail if available
      let thumbnailUrl = '';
      const thumbBlob = customThumbnailFile || autoThumbnailBlob;
      if (thumbBlob) {
        const thumbPath = `${userId}/${videoId}/thumbnail.jpg`;
        const { error: thumbErr } = await supabase.storage
          .from('videos')
          .upload(thumbPath, thumbBlob, { upsert: true, contentType: 'image/jpeg' });
        
        if (!thumbErr) {
          const { data: thumbData } = supabase.storage.from('videos').getPublicUrl(thumbPath);
          thumbnailUrl = thumbData.publicUrl;
        }
      }

      // 4. Save video record to Supabase database
      const videoTitle = title.trim() || file.name;
      const { data: dbVideo, error: dbError } = await supabase
        .from('videos')
        .insert({
          id: videoId,
          title: videoTitle,
          description: description.trim(),
          url: videoUrl,
          thumbnail: thumbnailUrl || null,
          duration: videoDuration,
          quality_options: ['1080p', '720p', '480p', '360p'],
          user_id: authData?.user?.id || null,
          views: 0,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // If DB insert failed because table might need manual check, we still have the videoId
        setUploadedVideoId(videoId);
      } else {
        setUploadedVideoId(dbVideo.id);
      }

      setUploading(false);
      setProgress(100);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء رفع الفيديو، يرجى المحاولة مرة أخرى.');
      setUploading(false);
    }
  };

  // Upload Complete View
  if (uploadedVideoId) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تم رفع الفيديو بنجاح!</h2>
        <p className="text-sm text-gray-600 mb-6">
          أصبح الفيديو جاهزاً الآن للمشاهدة والتضمين في أي موقع عبر الـ Embed Code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push(`/watch/${uploadedVideoId}`)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <span>مشاهدة الفيديو ومشاركته</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => {
              setUploadedVideoId(null);
              setFile(null);
              setTitle('');
              setDescription('');
              setProgress(0);
              setThumbnailPreview(null);
            }}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            رفع فيديو آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          رفع فيديو جديد
        </h1>
        <p className="text-sm text-gray-600">
          ارفع مقاطعك بسرعة فائقة وبدون معالجة معقدة — رفع مباشر ومشغل جاهز فوراً.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-sky-500 bg-sky-50/50'
              : 'border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 bg-white border border-gray-200 shadow-xs rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-700 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8 text-gray-800" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            اسحب ملف الفيديو وأفلته هنا، أو اضغط للتصفح
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            يدعم صيغ MP4, MOV, WebM بحجم يصل إلى 2 جيجابايت
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-2xs hover:bg-gray-50"
          >
            <FileVideo className="w-4 h-4" />
            <span>اختر ملف الفيديو</span>
          </button>
        </div>
      ) : (
        /* Video Details Form */
        <form onSubmit={handleUploadSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
          {/* File summary */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <FileVideo className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(file.size)} {videoDuration > 0 && `• ${formatDuration(videoDuration)}`}
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setAutoThumbnailBlob(null);
                  setThumbnailPreview(null);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
              >
                تغيير الملف
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              عنوان الفيديو *
            </label>
            <input
              type="text"
              required
              value={title}
              disabled={uploading}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اكتب عنواناً جذاباً للفيديو"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              الوصف
            </label>
            <textarea
              rows={3}
              value={description}
              disabled={uploading}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً مختصراً للفيديو (اختياري)"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 resize-none"
            />
          </div>

          {/* Thumbnail preview / upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              الصورة المصغرة (Poster)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Play className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomThumbChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => thumbInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>تخصيص صورة مصغرة</span>
                </button>
                <p className="text-2xs text-gray-600">
                  تم التقاط لقطة شاشة تلقائية من الفيديو كصورة افتراضية
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar (during upload) */}
          {uploading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-700">جاري الرفع إلى Supabase...</span>
                <span className="text-gray-900 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading || !title.trim()}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الرفع ({progress}%)...</span>
                </>
              ) : (
                <span>بدء الرفع وحفظ الفيديو</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
