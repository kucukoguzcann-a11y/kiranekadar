'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Users, ShieldCheck, AlertTriangle, HelpCircle, FileText, CheckCircle, RefreshCw, BarChart2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/analytics-engine';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  const statCards = [
    { title: 'Toplam Kira Kaydı', value: stats.totalReports, icon: Database, description: 'Sistemde kayıtlı toplam ilan ve veri sayısı', color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Onay Bekleyenler', value: stats.pendingReports, icon: HelpCircle, description: 'Güven puanı düşük veya ilk defa girilen veriler', color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Onaylı Veriler', value: stats.approvedReports, icon: CheckCircle, description: 'Haritada ve analizlerde listelenen veriler', color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Reddedilen Veriler', value: stats.rejectedReports, icon: FileText, description: 'Uç değerler veya spam olduğu belirlenenler', color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Uç Değer / Flagli', value: stats.flaggedReports, icon: AlertTriangle, description: 'Sistem tarafından otomatik işaretlenen uç değerler', color: 'text-red-600 bg-red-600/10' },
    { title: 'Kayıtlı Üye', value: stats.totalUsers, icon: Users, description: 'Sisteme kayıtlı toplam analiz kullanıcısı', color: 'text-indigo-500 bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sistem Genel Durumu (Özet)
          </h2>
          <p className="text-xs text-muted-foreground">
            Veri havuzu istatistikleri, moderasyon oranları ve üye sayıları.
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm" className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Yenile
        </Button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-border/50 shadow-sm relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {formatNumber(stat.value)}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground leading-normal">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avg Trust Card */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Ortalama Güven Puanı
            </CardTitle>
            <CardDescription className="text-xs">
              Sistemdeki onaylı verilerin ağırlıklı güven puanı ortalaması
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative flex items-center justify-center">
              {/* Radial or Big Circle representation */}
              <div className="h-32 w-32 rounded-full border-8 border-muted flex items-center justify-center">
                <span className="text-3xl font-extrabold text-emerald-500">
                  %{stats.averageTrustScore}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Güven puanı; üyelik durumu, email onayı, veri kaynağı doğruluğu ve uç değer eşleşmelerine göre dinamik hesaplanır.
            </p>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-accent" />
              En Aktif Şehirler
            </CardTitle>
            <CardDescription className="text-xs">
              Sistemde en çok kira kaydı barındıran ilk 5 şehir
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.topCities.map((city: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {idx + 1}.
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {city.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-36 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${(city.count / stats.totalReports) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {city.count} Kayıt
                    </span>
                  </div>
                </div>
              ))}
              {stats.topCities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Kayıtlı veri bulunmamaktadır.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 text-accent animate-spin" />
      <span className="text-sm text-muted-foreground font-semibold">İstatistikler yükleniyor...</span>
    </div>
  );
}
