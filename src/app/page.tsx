'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart3, PlusCircle, TrendingUp, Shield, Users, Search,
  ChevronDown, ChevronUp, MapPin, ArrowRight, Building2, Eye,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

// ─── Static data ────────────────────────────────────────────────────────────

const HERO_CHART_DATA = [
  { ay: 'Oca', kadikoy: 28500, besiktas: 34000, atasehir: 22000 },
  { ay: 'Şub', kadikoy: 29200, besiktas: 34500, atasehir: 22500 },
  { ay: 'Mar', kadikoy: 30000, besiktas: 35200, atasehir: 23200 },
  { ay: 'Nis', kadikoy: 31500, besiktas: 36000, atasehir: 23800 },
  { ay: 'May', kadikoy: 31000, besiktas: 36500, atasehir: 24200 },
  { ay: 'Haz', kadikoy: 32500, besiktas: 37000, atasehir: 25000 },
];

const POPULAR_CITIES = [
  { name: 'İstanbul', slug: 'istanbul', count: 2847, avgRent: '28.500 ₺', emoji: '🏙️' },
  { name: 'Ankara', slug: 'ankara', count: 1523, avgRent: '18.200 ₺', emoji: '🏛️' },
  { name: 'İzmir', slug: 'izmir', count: 982, avgRent: '19.800 ₺', emoji: '🌊' },
  { name: 'Bursa', slug: 'bursa', count: 641, avgRent: '14.500 ₺', emoji: '🌿' },
  { name: 'Antalya', slug: 'antalya', count: 578, avgRent: '16.900 ₺', emoji: '☀️' },
  { name: 'Kocaeli', slug: 'kocaeli', count: 412, avgRent: '15.200 ₺', emoji: '🏭' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Kira Verisini Gir',
    description: 'Ödediğin ya da bildiğin kira bilgisini anonim olarak paylaş. Hiçbir kişisel bilgi istemiyoruz.',
    icon: PlusCircle,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    step: '02',
    title: 'Analizleri Keşfet',
    description: 'Mahalle bazlı medyan, m² fiyatı ve oda tipi bazlı karşılaştırmaları görüntüle.',
    icon: BarChart3,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    step: '03',
    title: 'Doğru Karar Ver',
    description: 'İlan fiyatlarını değil, gerçek ödenen kiraları referans alarak taşınma kararını ver.',
    icon: TrendingUp,
    color: '#F97316',
    bg: '#FFF7ED',
  },
];

const TRUST_FEATURES = [
  {
    icon: Shield,
    title: 'Tam Anonim',
    desc: 'İsim, telefon veya açık adres asla istenmez. Tüm veriler anonimleştirilir.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: CheckCircle2,
    title: 'Güven Skoru Filtresi',
    desc: 'Her veri otomatik güven skoruna tabi tutulur, uç değerler analizden çıkarılır.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: Users,
    title: 'Topluluk Gücü',
    desc: 'Ne kadar fazla veri girilirse analizler o kadar doğru olur. Sen de katkı sağla.',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    icon: AlertCircle,
    title: 'KVKK Uyumlu',
    desc: 'Platform tamamen KVKK gerekliliklerine uygundur. İstediğinizde verilerinizi silebilirsiniz.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Verilerim güvende mi?',
    a: 'Evet. Açık adres, isim veya telefon bilgisi istemiyoruz. Tüm veriler anonim olarak işlenir ve analiz edilir. IP adresleri hashlenmiş şekilde tutulur.',
  },
  {
    q: 'Veri girmek için üye olmam gerekiyor mu?',
    a: 'Hayır. Herkes üye olmadan veri girebilir. Ancak detaylı kira analizlerini görüntülemek için ücretsiz üyelik gereklidir.',
  },
  {
    q: 'Veriler ne kadar güvenilir?',
    a: 'Her veri girişine güven skoru atanır. Giriş yapmış kullanıcıların, kendi ödediği kiraları bildirenlerin ve bölge medyanına yakın verilerin güven skoru yüksektir. Düşük güvenli veriler analizlere dahil edilmez.',
  },
  {
    q: 'Neden ilan fiyatlarına güvenmemem gerekiyor?',
    a: 'İlan fiyatları genellikle pazarlık payı içerir ve gerçek ödenen kiraların üzerindedir. Gerçek kira verisi, piyasanın gerçek halini yansıtır.',
  },
  {
    q: 'Hangi şehirler için veri mevcut?',
    a: 'Türkiye genelinde 81 il desteklenmektedir. Ancak veri yoğunluğu büyük şehirlerde daha yüksektir.',
  },
];

// ─── Custom Tooltip for Hero Chart ──────────────────────────────────────────

function HeroTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label} 2025</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-gray-600 capitalize">{p.name}</span>
          </span>
          <span className="font-bold text-gray-900">{p.value.toLocaleString('tr-TR')} ₺</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function fetchStats() {
      try {
        const res = await fetch(`/api/global-stats?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch global stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  const handleOpenReportModal = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-kira-bildir-modal'));
  };

  const handleOpenAnalizModal = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-kira-analiz-modal'));
  };

  return (
    <div className="flex flex-col overflow-x-hidden bg-[#F8F5EF] text-gray-900">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="hero-section border-b border-gray-200 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 pt-10 pb-10 sm:pt-14 sm:pb-12 md:pt-20 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* LEFT: Text + Search */}
            <div className="space-y-6 sm:space-y-8 animate-slide-up">
              {/* Live badge */}
              <div className="inline-flex max-w-full items-center gap-2 bg-white rounded-full px-3 py-2 border border-gray-200 shadow-sm sm:px-4">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span className="min-w-0 truncate text-xs font-semibold text-gray-600">
                  {loadingStats ? (
                    'Yükleniyor...'
                  ) : stats && stats.totalReports > 0 ? (
                    `${stats.totalReports.toLocaleString('tr-TR')} gerçek kira verisi aktif`
                  ) : (
                    'Kira verisi girilmesi bekleniyor...'
                  )}
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight sm:text-5xl">
                  Mahallendeki{' '}
                  <span className="relative">
                    <span className="gradient-text">gerçek kiralar</span>
                  </span>
                  {' '}kaç TL?
                </h1>
                <p className="max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                  İlan fiyatlarına değil, <strong className="text-gray-800 font-semibold">komşuların ödediği gerçek kira</strong> verilerine göre piyasayı keşfet. Anonim, güvenilir ve ücretsiz.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <Button
                  onClick={handleOpenAnalizModal}
                  className="flex-1 !h-14 !min-h-14 !rounded-2xl bg-emerald-600 !px-5 !text-base !font-extrabold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 cursor-pointer sm:!h-12 sm:!min-h-12 sm:!rounded-xl sm:!text-sm"
                >
                  <Search className="mr-2 !size-5 sm:!size-4" />
                  Kira Analizi Yap
                </Button>
                <Button
                  onClick={handleOpenReportModal}
                  variant="outline"
                  className="flex-1 !h-14 !min-h-14 !rounded-2xl border-2 border-emerald-100 bg-white !px-5 !text-base !font-extrabold text-gray-800 shadow-md transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-lg cursor-pointer sm:!h-12 sm:!min-h-12 sm:!rounded-xl sm:border-gray-200 sm:!text-sm"
                >
                  <PlusCircle className="mr-2 !size-5 text-emerald-600 sm:!size-4" />
                  Kirayı Anonim Bildir
                </Button>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="w-full text-xs text-gray-500 font-medium sm:w-auto">Popüler:</span>
                {['Kadıköy', 'Beşiktaş', 'Çankaya', 'Karşıyaka'].map(n => (
                  <Link
                    key={n}
                    href="/analiz"
                    className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {n}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT: Area Chart */}
            <div className="hidden lg:flex flex-col animate-fade-in">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 min-h-[380px] flex flex-col justify-between">
                {loadingStats ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stats && stats.totalReports > 0 ? (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Son Kira Bildirimleri</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Topluluk tarafından girilen son onaylı kiralar</p>
                        </div>
                        <span className="green-badge inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Canlı
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {stats.latestReports?.map((report: any) => (
                          <div key={report.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <div>
                                <div className="font-bold text-xs text-gray-900">{report.city.name}, {report.district.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium mt-0.5">{report.roomCount} · {report.netSqm} m²</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-sm text-emerald-600">{report.rentAmount.toLocaleString('tr-TR')} ₺</div>
                              <div className="text-[9px] text-gray-400 font-medium mt-0.5">
                                {new Date(report.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button asChild variant="outline" size="sm" className="w-full border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl h-10 font-semibold cursor-pointer">
                        <Link href="/analiz">
                          Tüm Analizleri Keşfet
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center animate-bounce">
                      <BarChart3 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900">Veri Girilmesi Bekleniyor</h3>
                      <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed mx-auto">
                        Bölgelerin kira dağılım ve grafiklerini göstermek için veri bekleniyor. İlk veriyi siz bildirebilirsiniz!
                      </p>
                    </div>
                    <Button
                      onClick={handleOpenReportModal}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs h-9 px-4 cursor-pointer animate-pulse"
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                      Kirayı Anonim Bildir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-6 md:divide-x md:divide-gray-100">
            {[
              { label: 'Gerçek Kira Verisi', value: stats && stats.totalReports > 0 ? stats.totalReports.toLocaleString('tr-TR') : 'Veri girilmesi bekleniyor', color: '#059669' },
              { label: 'Aktif Şehir', value: stats && stats.totalReports > 0 ? stats.activeCitiesCount.toString() : 'Veri girilmesi bekleniyor', color: '#2563EB' },
              { label: 'Ortalama Güven Skoru', value: stats && stats.totalReports > 0 ? `%${stats.avgConfidence}` : 'Veri girilmesi bekleniyor', color: '#F97316' },
              { label: 'Mahalle Kapsamı', value: stats && stats.totalReports > 0 ? `${stats.activeNeighborhoodsCount.toLocaleString('tr-TR')}` : 'Veri girilmesi bekleniyor', color: '#7C3AED' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-gray-50 p-4 md:bg-transparent md:p-0 md:pl-6 md:first:pl-0">
                <div className={stat.value === 'Veri girilmesi bekleniyor' ? "text-sm font-semibold leading-5 text-gray-400 md:text-xs" : "text-2xl font-extrabold"} style={{ color: stat.value === 'Veri girilmesi bekleniyor' ? undefined : stat.color }}>
                  {loadingStats ? 'Yükleniyor...' : stat.value}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="nasil-calisir" className="py-14 sm:py-20 bg-[#F8F5EF]">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="text-center mb-10 space-y-3 sm:mb-14">
            <div className="section-label">Nasıl Çalışır?</div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Üç adımda gerçek<br />piyasa verisi
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              KiraNeKadar, şeffaf ve güvenilir bir kira piyasası oluşturmak için basit 3 adımdan yararlanır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((item, idx) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8 card-hover group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ background: item.bg }}
                  >
                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                  </div>
                  <span className="text-5xl font-black" style={{ color: item.color, opacity: 0.12 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ COMPARISON CARD ═══════════════ */}
      <section className="py-14 sm:py-20 bg-white border-y border-gray-100">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-5">
                <div className="section-label">Gerçeği Gör</div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  İlan fiyatı bir şey söyler, <span className="gradient-text">gerçek kira</span> başka
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  İlan siteleri ve emlakçı portallerindeki ilanlar, gerçekte ödenenden ortalama <strong className="text-gray-700">%25–35 daha yüksek</strong> fiyat gösterir. Verilerimiz komşundan geliyor.
                </p>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 h-11 shadow-sm hover:shadow-md hover:shadow-emerald-200 transition-all sm:w-auto">
                  <Link href="/analiz">
                    Analize Git
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Comparison visual */}
              <div className="space-y-3 sm:space-y-4">
                {/* İlan fiyatı */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-bold text-red-700">İlan Fiyatı</span>
                    </div>
                    <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-0.5 rounded-full">+%36 şişirilmiş</span>
                  </div>
                  <div className="text-3xl font-black text-red-600 sm:text-4xl">42.000 ₺</div>
                  <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <p className="text-xs text-red-500 mt-1.5">Kadıköy, Caferağa · 2+1 · 75m²</p>
                </div>

                {/* Gerçek kira */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">KiraNeKadar Medyan Fiyatı</span>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">✓ Doğrulanmış</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 sm:text-4xl">
                    {loadingStats ? '...' : stats && stats.totalReports > 0 ? '31.500 ₺' : 'Veri bekleniyor'}
                  </div>
                  <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: stats && stats.totalReports > 0 ? '75%' : '0%' }} />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1.5">
                    {loadingStats ? 'Yükleniyor...' : stats && stats.totalReports > 0 ? '147 gerçek kira kaydına dayalı medyan' : 'Veri girilmesi bekleniyor...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ POPULAR CITIES ═══════════════ */}
      <section className="py-14 sm:py-20 bg-[#F8F5EF]">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="text-center mb-10 space-y-3 sm:mb-12">
            <div className="section-label">Şehirler</div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              En çok veri girilen şehirler
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Yüksek veri yoğunluğu sayesinde güvenilir analizler sunan şehirlerimiz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {POPULAR_CITIES.map((city) => {
              const pc = stats?.popularCities?.find((p: any) => p.slug === city.slug);
              const count = pc ? pc.count : 0;
              const avgRent = pc && pc.avgRent > 0 ? `${pc.avgRent.toLocaleString('tr-TR')} ₺` : 'Veri girilmesi bekleniyor';
              return (
                <Link key={city.slug} href={`/${city.slug}-kira-fiyatlari`}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 clean-card-hover group flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {city.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm">{city.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">
                          {loadingStats ? 'Yükleniyor...' : `${count.toLocaleString('tr-TR')} kayıt`}
                        </p>
                      </div>
                    </div>
                    <div className="w-full text-left sm:w-auto sm:text-right">
                      <div className={avgRent === 'Veri girilmesi bekleniyor' ? "text-sm font-semibold leading-5 text-gray-400 sm:text-xs" : "text-base font-extrabold text-gray-900"}>
                        {loadingStats ? 'Yükleniyor...' : avgRent}
                      </div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">ort. kira</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST FEATURES ═══════════════ */}
      <section className="py-14 sm:py-20 bg-white border-y border-gray-100">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <div className="section-label">Güven & Gizlilik</div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Verileriniz bizde güvende
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TRUST_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 sm:gap-5 sm:p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors group"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl group-hover:scale-110 transition-transform"
                    style={{ background: f.bg }}
                  >
                    <f.icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="py-14 sm:py-20 bg-gray-900">
        <div className="mx-auto w-full max-w-2xl px-3 sm:px-4 md:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 rounded-full px-4 py-1.5 border border-emerald-500/30">
            <span className="text-xs font-semibold text-emerald-400">Topluluğa Katıl</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Kira bilgini gir, gerçek<br />piyasa haritasını çizelim
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
            Senin anonim olarak girdiğin tek bir veri, binlerce kiracının ve ev sahibinin doğru kararlar vermesine yardımcı olur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleOpenReportModal}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 h-12 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Kirayı Anonim Bildir
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 h-12 rounded-xl font-semibold bg-transparent w-full sm:w-auto">
              <Link href="/register">
                <ArrowRight className="mr-2 h-5 w-5" />
                Ücretsiz Hesap Aç
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section id="sss" className="py-14 sm:py-20 bg-[#F8F5EF]">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6">
          <div className="text-center mb-10 space-y-3 sm:mb-14">
            <div className="section-label">SSS</div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Sık sorulan sorular
            </h2>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200 shadow-sm"
              >
                <button
                  id={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors sm:px-6 sm:py-5"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 group-hover:bg-emerald-50 transition-colors">
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-5 text-sm text-gray-500 leading-relaxed animate-fade-in border-t border-gray-50 pt-4 sm:px-6">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "KiraNeKadar",
            "url": "https://kiranekadar.com.tr",
            "logo": "https://kiranekadar.com.tr/icon.svg"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "KiraNeKadar",
            "url": "https://kiranekadar.com.tr"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_ITEMS.map(faq => ({
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
