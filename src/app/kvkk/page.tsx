import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'KiraNeKadar Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma ve rıza metni.',
};

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8 animate-fade-in text-left">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <ShieldAlert className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            KVKK Aydınlatma Metni
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>
            Son güncelleme: 3 Haziran 2026
          </p>
          <p>
            KiraNeKadar platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizin toplanması, işlenmesi, aktarılması ve haklarınız konusunda sizleri bilgilendirmek isteriz.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">1. İşlenen Kişisel Verileriniz</h2>
          <p>
            Platformumuzu kullanımınız kapsamında aşağıdaki verileriniz işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Kimlik ve İletişim Bilgileri:</strong> Üyelik esnasında girilen e-posta adresi, şifre ve isim.</li>
            <li><strong>İşlem ve Talep Bilgileri:</strong> Bildirilen konut kira bedeli, metrekare, oda sayısı vb. konut bilgileri.</li>
            <li><strong>İşlem Güvenliği Bilgileri:</strong> Giriş yapılan IP adresi, tarayıcı bilgisi, giriş zamanı.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground pt-4">2. Verilerin İşlenme Amaçları</h2>
          <p>
            Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları çerçevesinde aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>KiraNeKadar platformumuzda üyelik kaydının oluşturulması ve üye oturumlarının sürdürülmesi.</li>
            <li>Kullanıcılar tarafından bildirilen kira bedellerinin anonimleştirilerek bölge bazlı ortalama ve medyan grafiklerinin hesaplanması.</li>
            <li>Veri kalitesini korumak amacıyla spam veya uç değer veri girişlerinin tespiti (IP kontrolü, oturum doğrulaması).</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground pt-4">3. Kişisel Verilerinizin Aktarılması</h2>
          <p>
            KiraNeKadar, üyelik veya profil bilgilerinizi hiçbir ticari işletmeye veya reklam kuruluşuna aktarmaz veya satmaz. Verileriniz, yasal zorunluluk hallerinde yetkili kamu kurum ve kuruluşları ile mahkemeler haricinde üçüncü taraflarla paylaşılmamaktadır.
          </p>

          <h2 className="text-lg font-bold text-foreground pt-4">4. KVKK Kapsamındaki Haklarınız</h2>
          <p>
            KVKK'nın 11. maddesi uyarınca veri sahipleri olarak;
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
            <li>Kanun'da öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
          </ul>
          <p>
            haklarına sahipsiniz. Bu haklarınızı kullanmak için <a href="mailto:kvkk@kiranekadar.com.tr" className="text-accent hover:underline font-semibold">kvkk@kiranekadar.com.tr</a> adresi üzerinden başvuruda bulunabilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
