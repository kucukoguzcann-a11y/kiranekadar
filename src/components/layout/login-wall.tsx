import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginWallProps {
  children: React.ReactNode;
  dataCount?: number;
  lastUpdate?: string;
}

export default function LoginWall({ children, dataCount, lastUpdate }: LoginWallProps) {
  return (
    <div className="relative">
      {/* Blurred content behind */}
      <div className="blur-teaser" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="mx-4 max-w-md text-center animate-scale-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Lock className="h-7 w-7 text-accent" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Detaylı Analiz İçin Giriş Yapın</h3>
          <p className="mb-1 text-sm text-muted-foreground">
            Kira aralıkları, trendler ve benzer daire analizleri sadece üyeler tarafından görüntülenebilir.
          </p>
          {dataCount && (
            <p className="mb-4 text-xs text-accent font-medium">
              Bu bölgede {dataCount} kira verisi kayıtlı.{' '}
              {lastUpdate && <span>Son güncelleme: {lastUpdate}</span>}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <Link href="/register">Ücretsiz Üye Ol</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Üyelik tamamen ücretsizdir. E-posta ile hızlıca kayıt olabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
