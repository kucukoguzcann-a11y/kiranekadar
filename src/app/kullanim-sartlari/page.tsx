import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Şartları',
  description: 'KiraNeKadar platformu kullanım koşulları, kullanıcı yükümlülükleri ve yasal uyarılar.',
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <FileText className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Kullanım Şartları
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>
            Son güncelleme: 3 Haziran 2026
          </p>
          <p>
            KiraNeKadar web sitesine ve platformuna hoş geldiniz. Bu platformu kullanarak, aşağıda belirtilen kullanım şartlarını, yasal uyarıları ve koşulları kabul etmiş sayılırsınız. Lütfen hizmetlerimizi kullanmadan önce bu koşulları dikkatlice okuyunuz.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">1. Hizmet Tanımı ve Amaç</h2>
          <p>
            KiraNeKadar, kullanıcıların kira bedellerini tamamen anonim şekilde sisteme bildirdikleri ve bu verilerin istatistiksel grafikler halinde bölge bazlı yayınlandığı bir bilgi paylaşım platformudur. Platform, emlak sitelerindeki şişirilmiş veya spekülatif fiyatlara karşı şeffaf ve gerçekçi piyasa koşullarını göstermeyi hedefler.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">2. Doğru Veri Sağlama Yükümlülüğü</h2>
          <p>
            Sisteme veri giren her kullanıcı, verdiği bilgilerin kendi bilgisi dahilinde doğru, güncel ve dürüst olduğunu taahhüt eder. Sistem güvenliği için kasıtlı olarak hatalı, yanıltıcı veya spekülatif veri girişi yapan hesaplar askıya alınabilir veya engellenebilir.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">3. Fikri Mülkiyet ve Ticari Kullanım Yasağı</h2>
          <p>
            KiraNeKadar üzerindeki derlenmiş analizler, grafikler, harita konumları ve veri setlerinin mülkiyeti KiraNeKadar'e aittir. Bu veriler ticari amaçlarla (portföy oluşturma, pazar araştırması satışı vb.) yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz veya üçüncü partilere satılamaz. Kişisel ve ticari olmayan kullanımlar serbesttir.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">4. Sorumluluk Sınırları (Yasal Uyarı)</h2>
          <p>
            KiraNeKadar üzerinde yayınlanan medyan kiralar, grafikler ve istatistikler tamamen kullanıcı beyanlarına dayanmaktadır. Bu veriler <strong>resmi bir gayrimenkul değerleme veya yatırım tavsiyesi niteliği taşımamaktadır</strong>.
          </p>
          <p>
            Kullanıcıların bu sitedeki verileri referans alarak imzalayacağı kontratlar, yapacağı kiralama işlemleri veya alacağı finansal kararlardan doğabilecek doğrudan veya dolaylı zararlardan KiraNeKadar sorumlu tutulamaz.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">5. Koşullarda Değişiklik</h2>
          <p>
            KiraNeKadar, bu kullanım koşullarını dilediği zaman güncelleme hakkını saklı tutar. Güncellenen kullanım koşulları sitede yayınlandığı andan itibaren geçerlilik kazanır.
          </p>
        </div>

      </div>
    </div>
  );
}
