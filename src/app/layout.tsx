import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'KiraNeKadar - Mahallende Gerçek Kiralar Kaç TL?',
    template: '%s | KiraNeKadar',
  },
  description: 'İlan fiyatlarına değil, kullanıcıların paylaştığı gerçek kira verilerine göre bölge, mahalle ve daire özelliklerine göre kira analizi yap.',
  keywords: ['kira analizi', 'kira fiyatları', 'mahalle kira', 'gerçek kira', 'İstanbul kira', 'Ankara kira', 'kira karşılaştırma'],
  authors: [{ name: 'KiraNeKadar' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'KiraNeKadar',
    title: 'KiraNeKadar - Mahallende Gerçek Kiralar Kaç TL?',
    description: 'Kullanıcıların paylaştığı gerçek kira verileriyle mahalle bazlı kira analizi.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <TooltipProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
