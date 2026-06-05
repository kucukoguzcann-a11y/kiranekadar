import Link from 'next/link';
import { Map, Layers, Compass, ZoomIn, Lock, CheckCircle2, UserPlus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kira Haritası | Mahallendeki Gerçek Kiraları Keşfet',
  description: 'Kira haritası ile tüm illerdeki ve mahallelerdeki ödenen gerçek kira bedellerini harita üzerinde görselleştirerek inceleyin.',
};

export default function KiraHaritasiTeaser() {
  const features = [
    {
      icon: Map,
      title: 'İnteraktif Görselleştirme',
      description: 'Kira yoğunluğunu renkli ısı haritaları ve mahalle bazlı pinlerle doğrudan harita üzerinden takip edin.',
    },
    {
      icon: Layers,
      title: 'Filtre Katmanları',
      description: 'Oda sayısı, bina yaşı ve bina tipi gibi kriterlere göre haritayı anlık olarak süzün.',
    },
    {
      icon: ZoomIn,
      title: 'Sokak Düzeyinde Detay',
      description: 'İlgi duyduğunuz caddelere veya binalara yakın anonim kira bildirimlerini inceleyin.',
    },
    {
      icon: Compass,
      title: 'Bölge Kıyaslama',
      description: 'Yan yana iki mahallenin fiyat kontrastını harita renklerinden anında fark edin.',
    },
  ];

  const faqs = [
    {
      q: 'Kira haritasındaki veriler nereden geliyor?',
      a: 'Verilerimiz tamamen o bölgede yaşayan gerçek kiracılar veya yeni kontrat yapmış ev sahipleri tarafından anonim olarak bildirilen teyitli verilerden oluşur.',
    },
    {
      q: 'Kira haritası sokak seviyesinde tam adres gösteriyor mu?',
      a: 'Hayır, kullanıcı gizliliğini korumak adına tam adres bilgisi asla alınmaz ve gösterilmez. Bildirimler mahalle düzeyinde veya yaklaşık konumlarla haritaya işlenir.',
    },
    {
      q: 'Haritada filtreleme yapmak ücretli mi?',
      a: 'Hayır, ücretsiz üye olarak tüm haritayı, mahalle bazlı filtreleri ve detaylı veri katmanlarını tamamen ücretsiz kullanabilirsiniz.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-950" />
        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-3 h-3" /> Üyelere Özel Ücretsiz Araç
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Türkiye'nin İlk Gerçek Verili <span className="text-emerald-500 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Kira Haritası</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Sahibinden ilan fiyatlarını değil, kiracıların anonim olarak paylaştığı gerçek kira kontratı tutarlarını interaktif harita üzerinde mahalle mahalle keşfedin.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-950/20 cursor-pointer w-full sm:w-auto" asChild>
              <Link href="/register">Ücretsiz Üye Ol</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 cursor-pointer w-full sm:w-auto" asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mock Map / Demo Screen */}
      <section className="container mx-auto max-w-5xl -mt-10 px-4 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden relative aspect-[16/9] min-h-[350px]">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-slate-100 flex flex-col justify-between p-6 opacity-80 pointer-events-none select-none">
            {/* Mock Map Roads/Pins */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            
            {/* Simulated Pins */}
            <div className="absolute top-[25%] left-[20%] bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>Kadıköy: 32.500 ₺</span>
            </div>
            <div className="absolute top-[40%] left-[60%] bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>Beşiktaş: 37.000 ₺</span>
            </div>
            <div className="absolute top-[70%] left-[45%] bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>Ataşehir: 25.000 ₺</span>
            </div>
            <div className="absolute top-[55%] left-[15%] bg-emerald-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>Üsküdar: 28.000 ₺</span>
            </div>
          </div>

          {/* Locked Overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="max-w-md space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Harita Görünümü Kilitli</h3>
              <p className="text-sm text-slate-200">
                Seçtiğiniz lokasyonun sokak düzeyindeki kira dağılımını, mahalle ortalamalarını ve filtre katmanlarını görmek için ücretsiz üye olun.
              </p>
              <div className="pt-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer" asChild>
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" /> Ücretsiz Üye Ol ve Haritayı Aç
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto max-w-5xl py-20 px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Neden Kira Haritasını Kullanmalısınız?</h2>
          <p className="text-slate-600 max-w-xl mx-auto">Kira haritamız, ev arayışınızda veya evinizi kiraya verirken en doğru kararı vermenizi sağlar.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                <f.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who is it for? */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-extrabold">Kimler İçin Faydalı?</h2>
            <p className="text-slate-400">Herkes için şeffaf ve güvenli kira verisi.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="font-bold text-lg">Ev Arayan Kiracılar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Taşınmak istediğiniz mahallenin gerçekten ne kadar kira ödediğini öğrenin. Fahiş fiyat tekliflerinden korunun.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="font-bold text-lg">Ev Sahipleri</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Evinizin gerçek piyasa değerini, komşularınızın ödediği kira miktarlarını referans alarak belirleyin.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="font-bold text-lg">Gayrimenkul Danışmanları</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Müşterilerinize sunmak üzere bölgenin gerçek veri tabanlı kira raporlarına ve ısı haritalarına erişin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SSS Accordion */}
      <section className="container mx-auto max-w-4xl py-20 px-4">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Sıkça Sorulan Sorular</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200/80">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {faq.q}
              </h3>
              <p className="text-sm text-slate-600 mt-2 pl-3.5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="container mx-auto max-w-5xl pb-20 px-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold">Gerçek Kira Bedellerini Haritada Görün</h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-lg">
              Hemen ücretsiz üye olarak kira haritası, karşılaştırma aracı ve detaylı bölge raporlarına anında erişin.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button size="lg" className="bg-white hover:bg-slate-100 text-emerald-700 font-semibold cursor-pointer w-full sm:w-auto" asChild>
              <Link href="/register">Ücretsiz Üye Ol</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-emerald-500 hover:bg-emerald-500/20 text-white cursor-pointer w-full sm:w-auto" asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
    </div>
  );
}
