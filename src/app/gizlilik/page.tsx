import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'KiraNeKadar kullanıcı gizliliği ve anonim veri saklama politikası.',
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Gizlilik Politikası
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>
            Son güncelleme: 3 Haziran 2026
          </p>
          <p>
            KiraNeKadar platformu olarak kişisel verilerinizin gizliliğine ve güvenliğine büyük önem veriyoruz. Bu gizlilik politikası, web sitemizi kullanırken hangi verilerin toplandığını, nasıl işlendiğini ve verilerinizin nasıl korunacağını açıklamaktadır.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">1. Toplanan Veriler ve Anonimlik</h2>
          <p>
            KiraNeKadar üzerinde veri paylaşımı yaptığınızda girmiş olduğunuz konut büyüklüğü (m²), oda sayısı, kat, bina yaşı, otopark/asansör gibi yapısal donanımlar ve ödediğiniz net kira bedeli sisteme kaydedilir.
          </p>
          <p>
            <strong>Garantimiz:</strong> Bu bilgiler sizin e-posta veya isim gibi kimlik verilerinizden tamamen arındırılmış olarak veritabanımızda saklanır. Diğer platform kullanıcıları sizin tam adresinizi veya kullanıcı profilinizi asla göremez.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">2. Üyelik Bilgileri</h2>
          <p>
            Platformdaki kira verilerini ve analizlerini detaylı şekilde görüntülemek için üye olmanız gerekmektedir. Üye kaydı sırasında e-posta adresiniz, şifreniz ve varsa isminiz Supabase Auth güvencesiyle saklanır. Üyelik bilgileriniz hiçbir koşulda üçüncü taraflara satılmaz veya paylaşılmaz.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">3. Çerezler (Cookies)</h2>
          <p>
            Web sitemizde, kullanıcı oturumunu yönetmek ve kullanıcı deneyimini optimize etmek amacıyla oturum çerezleri kullanılmaktadır. Çerezler, güvenli protokoller üzerinden tarayıcınızda şifrelenmiş olarak saklanır.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">4. Veri Güvenliği</h2>
          <p>
            Sistemdeki tüm veriler endüstri standardı şifreleme yöntemleriyle korunmaktadır. Supabase veritabanı altyapısı ve güvenlik katmanları sayesinde verilerinizin yetkisiz erişime karşı güvenliği en üst seviyede tutulur.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">5. İletişim</h2>
          <p>
            Gizlilik politikamız ile ilgili soru veya talepleriniz için <a href="mailto:gizlilik@kiranekadar.com.tr" className="text-accent hover:underline font-semibold">gizlilik@kiranekadar.com.tr</a> adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
