'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Code, Link as LinkIcon } from 'lucide-react';
import { getSiteUrl } from '@/lib/utils';

interface EmbedModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmbedModal({ videoId, isOpen, onClose }: EmbedModalProps) {
  const [activeTab, setActiveTab] = useState<'embed' | 'link'>('embed');
  const [widthType, setWidthType] = useState<'100%' | 'custom'>('100%');
  const [customWidth, setCustomWidth] = useState<number>(640);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '4/3'>('16/9');
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [linkTimestamp, setLinkTimestamp] = useState<boolean>(false);
  const [linkStartTime, setLinkStartTime] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [siteUrl, setSiteUrl] = useState<string>('');

  useEffect(() => {
    setSiteUrl(getSiteUrl());
  }, []);

  if (!isOpen) return null;

  // Build embed src
  const embedParams = new URLSearchParams();
  if (autoplay) embedParams.set('autoplay', '1');
  if (startTime > 0) embedParams.set('start', startTime.toString());

  const queryString = embedParams.toString() ? `?${embedParams.toString()}` : '';
  const embedUrl = `${siteUrl}/embed/${videoId}${queryString}`;

  const iframeWidth = widthType === '100%' ? '100%' : `${customWidth}px`;
  const iframeCode = `<iframe 
  src="${embedUrl}"
  width="${iframeWidth}" 
  style="aspect-ratio: ${aspectRatio.replace('/', '/')}; border: none; border-radius: 8px;"
  frameborder="0" 
  allow="autoplay; fullscreen" 
  allowfullscreen>
</iframe>`;

  // Build direct link
  const directLinkParams = linkTimestamp && linkStartTime > 0 ? `?t=${linkStartTime}` : '';
  const directLinkUrl = `${siteUrl}/watch/${videoId}${directLinkParams}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">مشاركة الفيديو</h2>
            
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg text-sm">
              <button
                onClick={() => setActiveTab('embed')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'embed'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>كود التضمين</span>
              </button>
              <button
                onClick={() => setActiveTab('link')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'link'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>الرابط المباشر</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {activeTab === 'embed' ? (
            <>
              {/* Customization Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                {/* Width */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1.5">عرض المشغل (Width)</label>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setWidthType('100%')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        widthType === '100%'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      100% تلقائي
                    </button>
                    <button
                      onClick={() => setWidthType('custom')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        widthType === 'custom'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      مخصص (px)
                    </button>
                    {widthType === 'custom' && (
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-lg text-center"
                        min={200}
                        max={1920}
                      />
                    )}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1.5">نسبة الأبعاد (Aspect Ratio)</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAspectRatio('16/9')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        aspectRatio === '16/9'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      16:9 (الافتراضي)
                    </button>
                    <button
                      onClick={() => setAspectRatio('4/3')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        aspectRatio === '4/3'
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      4:3
                    </button>
                  </div>
                </div>

                {/* Autoplay */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-gray-700">تشغيل تلقائي (Autoplay)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                {/* Start Time */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-gray-700">البدء عند (ثانية):</span>
                  <input
                    type="number"
                    min={0}
                    value={startTime}
                    onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-lg text-center"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    كود الـ iframe الجاهز
                  </span>
                  <button
                    onClick={() => handleCopy(iframeCode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative rounded-xl bg-gray-950 p-4 text-xs font-mono text-gray-200 overflow-x-auto border border-gray-800 dir-ltr text-left">
                  <pre className="whitespace-pre-wrap break-all">{iframeCode}</pre>
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  معاينة حية للمشغل (Live Preview)
                </span>
                <div className="relative w-full rounded-xl overflow-hidden bg-black border border-gray-200" style={{ aspectRatio: aspectRatio.replace('/', '/') }}>
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Direct Link */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  رابط الفيديو المباشر
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directLinkUrl}
                    className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono select-all focus:outline-none focus:ring-1 focus:ring-gray-900 dir-ltr text-left"
                  />
                  <button
                    onClick={() => handleCopy(directLinkUrl)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>تم!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timestamp option */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkTimestamp}
                    onChange={(e) => setLinkTimestamp(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span>البدء عند وقت محدد:</span>
                </label>
                {linkTimestamp && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={linkStartTime}
                      onChange={(e) => setLinkStartTime(Math.max(0, Number(e.target.value)))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center"
                      placeholder="ثانية"
                    />
                    <span className="text-xs text-gray-600">ثانية</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
