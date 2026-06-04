'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  const handleOpenReportModal = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-kira-bildir-modal'));
  };

  return (
    <footer className="border-t border-gray-100 bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">KiraNeKadar</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Gerçek kira verilerini mahalle mahalle analiz et. İlan fiyatlarına değil, kullanıcıların paylaştığı gerçek verilere güven.
            </p>
          </div>

          {/* En Çok Aranan İller */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-gray-300 uppercase tracking-widest">Kira Fiyatları</h4>
            <ul className="space-y-3">
              <li><Link href="/istanbul-kira-fiyatlari" className="text-sm text-gray-400 hover:text-white transition-colors">İstanbul Kira Fiyatları</Link></li>
              <li><Link href="/ankara-kira-fiyatlari" className="text-sm text-gray-400 hover:text-white transition-colors">Ankara Kira Fiyatları</Link></li>
              <li><Link href="/izmir-kira-fiyatlari" className="text-sm text-gray-400 hover:text-white transition-colors">İzmir Kira Fiyatları</Link></li>
              <li><Link href="/bursa-kira-fiyatlari" className="text-sm text-gray-400 hover:text-white transition-colors">Bursa Kira Fiyatları</Link></li>
              <li><Link href="/antalya-kira-fiyatlari" className="text-sm text-gray-400 hover:text-white transition-colors">Antalya Kira Fiyatları</Link></li>
            </ul>
          </div>

          {/* Keşfet */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-gray-300 uppercase tracking-widest">Keşfet</h4>
            <ul className="space-y-3">
              <li><Link href="/kira-fiyatlari" className="text-sm text-gray-400 hover:text-white transition-colors">Tüm İller</Link></li>
              <li><Link href="/analiz" className="text-sm text-gray-400 hover:text-white transition-colors">Kira Analizi Yap</Link></li>
              <li><Link href="/harita" className="text-sm text-gray-400 hover:text-white transition-colors">Kira Haritası</Link></li>
              <li><Link href="/karsilastir" className="text-sm text-gray-400 hover:text-white transition-colors">Kira Karşılaştırma</Link></li>
              <li>
                <Link
                  href="/?show-report-modal=true"
                  onClick={handleOpenReportModal}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Kirayı Anonim Bildir
                </Link>
              </li>
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-gray-300 uppercase tracking-widest">Destek</h4>
            <ul className="space-y-3">
              <li><Link href="/#nasil-calisir" className="text-sm text-gray-400 hover:text-white transition-colors">Nasıl Çalışır?</Link></li>
              <li><Link href="/#sss" className="text-sm text-gray-400 hover:text-white transition-colors">Sık Sorulan Sorular</Link></li>
              <li><a href="mailto:destek@kiranekadar.com.tr" className="text-sm text-gray-400 hover:text-white transition-colors">İletişim</a></li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-gray-300 uppercase tracking-widest">Yasal</h4>
            <ul className="space-y-3">
              <li><Link href="/gizlilik" className="text-sm text-gray-400 hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kvkk" className="text-sm text-gray-400 hover:text-white transition-colors">KVKK Aydınlatma</Link></li>
              <li><Link href="/kullanim-sartlari" className="text-sm text-gray-400 hover:text-white transition-colors">Kullanım Şartları</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} KiraNeKadar. Tüm hakları saklıdır. Veriler anonim olarak işlenir.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            <p className="text-xs text-gray-500">Tüm sistemler çalışıyor</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
