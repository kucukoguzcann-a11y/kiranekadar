import Link from 'next/link';
import { Columns2, ArrowLeftRight, Activity, Percent, Lock, CheckCircle2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kira Karşılaştırma | Lokasyon ve Daire Kıyaslama',
  description: 'Farklı şehirlerin, ilçelerin veya mahallelerin kira fiyatlarını, m² bedellerini ve daire özelliklerini karşılaştırma aracı ile kıyaslayın.',
};

export default function KiraKarsilastirmaTeaser() {
  const features = [
    {
      icon: Columns2,
      title: 'Yan Yana Karşılaştırma',
      description: 'İki veya daha fazla şehri, ilçeyi veya mahalleyi tüm parametreleri ile yan yana karşılaştırın.',
    },
    {
      icon: ArrowLeftRight,
      title: 'Bölgesel Sapma Tespiti',
      description: 'Dairenizin kirasını, mahalle medyanına göre kıyaslayarak sapma yüzdesini hesaplayın.',
    },
    {
      icon: Percent,
      title: 'm² Verimliliği Analizi',
      description: 'Hangi bölgede m² başına ödenen kiranın daha avantajlı olduğunu kolayca hesaplayın.',
    },
    {
      icon: Activity,
      title: 'Oda Tipi Dağılımı',
      description: '1+1, 2+1 ve 3+1 daire tiplerinin bölgeler arası fiyat kırılımlarını eşleştirin.',
    },
  ];

  const faqs = [
    {
      q: 'Kira karşılaştırma aracı ile hangi lokasyonları karşılaştırabilirim?',
      a: 'Sistemimizde kayıtlı olan ve yeterli veri eşiğini aşan tüm il, ilçe ve mahalleleri kendi aralarında serbestçe karşılaştırabilirsiniz.',
    },
    {
      q: 'Kendi dairemin kirasını da karşılaştırabilir miyim?',
      a: 'Evet, karşılaştırma aracına kendi dairenizin özelliklerini ve kiranızı girerek, bulunduğunuz mahalle ortalamasından ne kadar saptığını görebilirsiniz.',
    },
    {
      q: 'Karşılaştırma raporlarını PDF olarak indirebilir miyim?',
      a: 'Evet, üye girişi yaptıktan sonra oluşturduğunuz tüm karşılaştırma grafiklerini ve tablolarını rapor formatında kaydedebilirsiniz.',
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
            Gelişmiş <span className="text-emerald-500 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Kira Karşılaştırma</span> Aracı
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Hangi mahalle bütçenize daha uygun? Bölgeler arasındaki fiyat farklarını, m² kira bedellerini ve daire tipi bazlı dağılımları saniyeler içinde analiz edin.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-950/20 cursor-pointer" asChild>
              <Link href="/register">Ücretsiz Üye Ol</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 cursor-pointer" asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mock Comparison / Demo Screen */}
      <section className="container mx-auto max-w-5xl -mt-10 px-4 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden relative aspect-[16/9] min-h-[350px]">
          {/* Simulated Comparison Table */}
          <div className="absolute inset-0 bg-slate-50 p-6 opacity-60 pointer-events-none select-none">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-4">
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-4">
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-4">
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Locked Overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="max-w-md space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Karşılaştırma Sihirbazı Kilitli</h3>
              <p className="text-sm text-slate-200">
                Seçtiğiniz mahallelerin kira metriklerini yan yana tablo ve grafiklerle detaylı kıyaslamak için ücretsiz üye olun.
              </p>
              <div className="pt-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer" asChild>
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" /> Üye Ol ve Karşılaştırmayı Başlat
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
          <h2 className="text-3xl font-extrabold text-slate-900">Karşılaştırma Aracı Neler Sunar?</h2>
          <p className="text-slate-600 max-w-xl mx-auto">Kira bedellerini tek tek aramak yerine, hepsini tek bir ekranda yan yana kıyaslayın.</p>
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
            <p className="text-slate-400">Karşılaştırma aracı ile daha verimli kararlar alın.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="font-bold text-lg">Yeni Eve Taşınanlar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ataşehir mi Kadıköy mü? Hangi mahallede bütçenize göre daha büyük bir daire kiralayabileceğinizi anında hesaplayın.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="font-bold text-lg">Mevcut Kiracılar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ev sahibinizin talep ettiği yeni kira artışının, benzer mahallelerdeki artış oranlarına uyumunu denetleyin.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="font-bold text-lg">Yatırımcılar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Yüksek amortisman (kira çarpanı) sağlayan avantajlı mahalle ve oda tiplerini kıyaslama listelerimizden tespit edin.
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
            <h2 className="text-2xl md:text-3xl font-bold">Kira Fiyatlarını Karşılaştırmaya Başlayın</h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-lg">
              Hemen ücretsiz üye olun, bölgelerin m² bazlı kiralarını kıyaslayarak en verimli konutu seçin.
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
