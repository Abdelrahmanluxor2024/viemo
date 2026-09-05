'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Play, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;
        setMessage('تم إنشاء الحساب بنجاح! تم تسجيل دخولك.');
        setTimeout(() => router.push('/'), 1000);
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'فشلت عملية المصادقة، يرجى التأكد من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gray-950 flex items-center justify-center text-white mx-auto mb-3">
            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'إنشاء حساب في Viemo' : 'تسجيل الدخول إلى Viemo'}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            منصة استضافة الفيديوهات البسيطة والخفيفة
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-3 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all dir-ltr text-left"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all dir-ltr text-left"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isSignUp ? 'إنشاء الحساب' : 'دخول'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-gray-600">
          {isSignUp ? (
            <span>
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-semibold text-gray-900 hover:underline"
              >
                تسجيل الدخول
              </button>
            </span>
          ) : (
            <span>
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-semibold text-gray-900 hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-900">
            الاستمرار كزائر والعودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
