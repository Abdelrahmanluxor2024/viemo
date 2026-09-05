import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Viemo - استضافة ومشغل الفيديوهات فائق السرعة',
  description: 'منصة استضافة فيديوهات خفيفة وسريعة بدعم التضمين في أي موقع ومشغل Plyr احترافي',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-white text-gray-900 antialiased min-h-screen flex flex-col selection:bg-sky-100 selection:text-sky-900">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Viemo. استضافة ومشغل الفيديوهات المينيمل.</span>
            <div className="flex gap-4">
              <span>خفيف وسريع</span>
              <span>•</span>
              <span>مشغل Plyr معرب</span>
              <span>•</span>
              <span>كود تضمين مباشر</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
