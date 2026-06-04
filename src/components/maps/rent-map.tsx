'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const MapClient = dynamic(() => import('./map-client'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-card rounded-xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
        <span className="text-sm text-muted-foreground font-semibold">Harita yükleniyor...</span>
      </div>
    </div>
  ),
});

export default function RentMap() {
  return <MapClient />;
}
