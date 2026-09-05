import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viemo Embed Player',
  robots: 'noindex, follow',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen m-0 p-0 overflow-hidden bg-black flex items-center justify-center">
      {children}
    </div>
  );
}
