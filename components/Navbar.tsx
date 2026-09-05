'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, Play, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Don't render navbar in embed pages
  if (pathname.startsWith('/embed/')) {
    return null;
  }

  useEffect(() => {
    // Check current auth status
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-gray-900 group">
            <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-950">
              Viemo
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>رفع فيديو</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 hidden sm:inline-block max-w-[120px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  title="تسجيل الخروج"
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>دخول</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
