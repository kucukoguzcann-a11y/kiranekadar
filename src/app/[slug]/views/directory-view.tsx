import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ArrowRight } from 'lucide-react';

export default async function DirectoryView() {
  // Fetch all cities and count how many approved reports they have
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          rentReports: {
            where: { status: 'approved' },
          },
        },
      },
    },
  });

  // Highlight cities with reports
  const popularCities = cities.filter(c => c._count.rentReports > 0);
  const otherCities = cities.filter(c => c._count.rentReports === 0);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Bölgelere Göre Kira Fiyatları
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerçek kullanıcı verileriyle oluşturulmuş kira endeksini görmek istediğiniz şehri seçin.
          </p>
        </div>

        {/* Popular Cities */}
        {popularCities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
              Aktif Veri Bulunan Şehirler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {popularCities.map((city) => (
                <Link key={city.id} href={`/${city.slug}-kira-fiyatlari`} className="group">
                  <Card className="hover:border-accent/40 group-hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {city.plateCode}
                          </span>
                          <span className="font-semibold text-sm group-hover:text-accent transition-colors">
                             {city.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {city._count.rentReports} kira verisi kayıtlı
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Cities Directory */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Tüm Şehirler
          </h2>
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/${city.slug}-kira-fiyatlari`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 text-xs font-semibold text-muted-foreground hover:text-accent transition-colors"
                >
                  <span className="font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded bg-muted shrink-0">
                    {city.plateCode}
                  </span>
                  <span className="truncate">{city.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
