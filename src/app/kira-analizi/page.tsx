import Link from 'next/link';
import { BarChart3, TrendingUp, ShieldAlert, FileSpreadsheet, Lock, CheckCircle2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kira Analizi | Detaylı Bölge Kira Raporu',
  description: 'Seçtiğiniz lokasyonun medyan kira bedeli, oda sayısı kırılımları, veri dağılımı ve detaylı kira analizini gelişmiş grafiklerle raporlayın.',
};

export default function KiraAnaliziTeaser() {
  const features = [
    {
      icon: BarChart3,
      title: 'Medyan ve Ortalama Analizi',
      description: 'Aşırı yüksek veya fahiş fiyatlı tekliflerden arındırılmış gerçekçi medyan (ortanca) ve ortalama kira hesaplamaları.',
    },
    {
      icon: TrendingUp,
      title: 'Oda Tipi ve Metrekare Kırılımı',
      description: '1+0, 1+1, 2+1 ve 3+1 dairelerin m² başına düşen kira performanslarını karşılaştırmalı olarak inceleyin.',
    },
    {
      icon: ShieldAlert,
      title: 'Güvenlik ve Doğrulama Seviyesi',
      description: 'Raporlanan verilerin doğruluğunu, veri sayısına ve istatistiksel güven aralığına göre (güven skoru) şeffafça izleyin.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Bina Yaşı ve Kat Analizleri',
      description: 'Yeni binalar ile yaşlı binalar, giriş katlar ile ara katlar arasındaki fiyat farklarını grafiksel olarak görün.',
    },
  ];

  const faqs = [
    {
      q: 'Kira analizi raporlarında veri güvenilirliği nasıl sağlanıyor?',
      a: 'Her bildirim sistemimiz tarafından uç değer (outlier) süzgecinden geçirilir. Bildirilen konumun ve daire özelliklerinin tarihsel trendlere uygunluğu kontrol edilerek analizlere dahil edilir.',
    },
    {
      q: 'Veri az olan mahalleler için analiz yapılıyor mu?',
      a: 'Veri sayısı 1-4 olan bölgelerde "temsil gücü sınırlı" uyarısı gösterilir. Doğru analiz için en az 5, gelişmiş analizler için 20+ veri girişi aranır.',
    },
    {
      q: 'Kira analiz raporlarını kendi aramalarım için kaydedebilir miyim?',
      a: 'Evet, üye olduğunuzda istediğiniz bölgeyi takibe alabilir, fiyat değişimlerini e-posta veya bildirim olarak alabilirsiniz.',
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
            Detaylı <span className="text-emerald-500 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Kira Analizi</span> ve Bölge Raporu
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            İlanlar arasındaki kafa karıştırıcı fiyatları unutun. Bölgenin gerçek ödenen kira ortalamasını, m² birim fiyatını ve dağılım grafiklerini tek raporda görüntüleyin.
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

      {/* Mock Analytics / Demo Screen */}
      <section className="container mx-auto max-w-5xl -mt-10 px-4 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden relative aspect-[16/9] min-h-[350px]">
          {/* Simulated Charts and Stats */}
          <div className="absolute inset-0 bg-slate-50 p-6 opacity-60 pointer-events-none select-none">
            <div className="flex flex-col gap-6 h-full justify-between">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-3 rounded-lg"><div className="h-4 w-16 bg-slate-200 rounded mb-2" /><div className="h-6 w-24 bg-slate-300 rounded" /></div>
                <div className="bg-white border border-slate-200 p-3 rounded-lg"><div className="h-4 w-16 bg-slate-200 rounded mb-2" /><div className="h-6 w-24 bg-slate-300 rounded" /></div>
                <div className="bg-white border border-slate-200 p-3 rounded-lg"><div className="h-4 w-16 bg-slate-200 rounded mb-2" /><div className="h-6 w-24 bg-slate-300 rounded" /></div>
                <div className="bg-white border border-slate-200 p-3 rounded-lg"><div className="h-4 w-16 bg-slate-200 rounded mb-2" /><div className="h-6 w-24 bg-slate-300 rounded" /></div>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex-1 flex items-end justify-between gap-2 px-10">
                <div className="w-12 bg-slate-200 rounded-t h-[40%]" />
                <div className="w-12 bg-slate-300 rounded-t h-[60%]" />
                <div className="w-12 bg-slate-200 rounded-t h-[50%]" />
                <div className="w-12 bg-emerald-300 rounded-t h-[80%]" />
                <div className="w-12 bg-slate-200 rounded-t h-[30%]" />
              </div>
            </div>
          </div>

          {/* Locked Overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="max-w-md space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Detaylı Analiz Raporları Kilitli</h3>
              <p className="text-sm text-slate-200">
                İl, ilçe ve mahalle bazında detaylı grafikler, m² kira trendleri, oda sayısı dağılımları ve tarihsel değişimleri görmek için ücretsiz üye olun.
              </p>
              <div className="pt-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer" asChild>
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" /> Ücretsiz Üye Ol ve Analizleri Aç
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
          <h2 className="text-3xl font-extrabold text-slate-900">Detaylı Raporlama Araçlarımız</h2>
          <p className="text-slate-600 max-w-xl mx-auto">Kira bedellerinin arkasındaki gerçek trendleri ve oda tipi dağılımlarını anında analiz edin.</p>
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
            <p className="text-slate-400">Veriye dayalı gayrimenkul analizleri ile risklerinizi minimize edin.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="font-bold text-lg">Bilinçli Kiracılar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Taşınmayı düşündüğünüz bölgede fahiş fiyat artış oranları veya yanıltıcı piyasa spekülasyonları hakkında bilgi sahibi olun.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="font-bold text-lg">Bölge Ev Sahipleri</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Kira kontratı yenileme döneminde kiracınızla hakkaniyetli ve güncel bölge medyan değerlerine dayalı bir artışta anlaşın.
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="font-bold text-lg">Emlak Yatırımcıları</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hangi bölgede kira getirisi m² fiyatına göre daha cazip amortisman süreleri sunuyor, veri üzerinden inceleyerek karar verin.
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
            <h2 className="text-2xl md:text-3xl font-bold">Kira Analiz Raporlarına Erişin</h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-lg">
              Hemen ücretsiz üye olun, lokasyon bazlı gerçek medyan kira analizlerini ve dağılım grafiklerini görüntüleyin.
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
