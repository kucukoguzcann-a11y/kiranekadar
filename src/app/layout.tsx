import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('kira-auth');
  let user = null;

  if (authCookie?.value) {
    try {
      user = JSON.parse(authCookie.value);
    } catch {
      user = null;
    }
  }

  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.dataLayer = window.dataLayer || [];',
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TXW69R3M');`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7462168937721680"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TXW69R3M"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <TooltipProvider>
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
