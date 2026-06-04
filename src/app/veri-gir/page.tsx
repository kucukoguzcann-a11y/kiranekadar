import type { Metadata } from 'next';
import { Suspense } from 'react';
import RentFormWizard from '@/components/forms/rent-form-wizard';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kira Verisi Gir',
  description: 'Yaşadığınız veya bildiğiniz konuta ait gerçek kira bilgilerini girerek mahalle analizine katkıda bulunun.',
};

export default function VeriGirPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-12 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Kira Bilgisi Paylaş
          </h1>
          <p className="text-sm text-muted-foreground">
            Emlak sitelerindeki yapay fiyat artışlarının önüne geçmek için ödediğiniz gerçek kirayı anonim olarak paylaşın. Bilgileriniz şifrelenir ve asla üçüncü taraflarla paylaşılmaz.
          </p>
        </div>

        {/* Wizard Form */}
        <Suspense fallback={
          <div className="w-full max-w-4xl mx-auto p-12 flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-900/60 rounded-2xl border border-border/50 shadow-xl">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-semibold">Yükleniyor...</p>
          </div>
        }>
          <RentFormWizard />
        </Suspense>
      </div>
    </div>
  );
}
