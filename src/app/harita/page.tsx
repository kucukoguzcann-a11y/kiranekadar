import type { Metadata } from 'next';
import RentMap from '@/components/maps/rent-map';

export const metadata: Metadata = {
  title: 'Kira Haritası',
  description: 'Türkiye\'nin mahalle mahalle gerçek kira fiyatlarını harita üzerinde interaktif olarak analiz edin.',
};

export default function HaritaPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Page Header */}
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            İnteraktif Kira Haritası
          </h1>
          <p className="text-sm text-muted-foreground">
            Bölgelerdeki gerçek kira bedellerini renk kodlu mahalle kırılımlarına göre interaktif olarak analiz edin.
          </p>
        </div>

        {/* Dynamic Leaflet Map */}
        <RentMap />
      </div>
    </div>
  );
}
