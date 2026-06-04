'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { formatCurrency } from '@/lib/analytics-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Landmark, Compass, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MapPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  cityName: string;
  citySlug: string;
  districtName: string;
  districtSlug: string;
  neighborhoodSlug: string;
  medianRent: number;
  averageRent: number;
  rentPerSqm: number;
  count: number;
  confidenceScore: number;
}

export default function MapClient() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMapPoints() {
      try {
        const res = await fetch('/api/locations/map');
        if (res.ok) {
          const data = await res.json();
          setPoints(data);
        }
      } catch (err) {
        console.error('Harita noktaları yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMapPoints();
  }, []);

  const getTrustBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-500';
    if (score >= 60) return 'bg-blue-500/10 text-blue-500';
    if (score >= 40) return 'bg-amber-500/10 text-amber-500';
    return 'bg-rose-500/10 text-rose-500';
  };

  // Custom marker icon creation if needed, otherwise default icon compatibility will handle it.
  const getMarkerIcon = (rent: number) => {
    // Return a colored circle or division depending on rent pricing (for heat mapping or price levels)
    let color = 'hsl(217, 91%, 60%)'; // default blue
    if (rent > 30000) color = 'hsl(350, 89%, 60%)'; // expensive: red
    else if (rent > 20000) color = 'hsl(25, 95%, 53%)'; // mid-high: orange
    else if (rent > 10000) color = 'hsl(142, 71%, 45%)'; // moderate: green

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4)"></div>`,
      className: 'custom-map-marker',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  };

  if (loading) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-card rounded-xl border border-border/50 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
          <span className="text-sm text-muted-foreground font-semibold">Harita yükleniyor ve konumlar çiziliyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border/50 shadow-md relative z-10">
      <MapContainer
        center={[39.9334, 32.8597]} // Centered on Turkey
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={getMarkerIcon(point.medianRent)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 space-y-3 w-56 text-left">
                {/* Neighborhood Name */}
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-foreground leading-tight">{point.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-none">
                    {point.districtName}, {point.cityName}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-wider font-semibold">Medyan Kira</span>
                    <strong className="text-foreground font-bold">{formatCurrency(point.medianRent)}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-wider font-semibold">Veri Sayısı</span>
                    <strong className="text-foreground font-bold">{point.count} Adet</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2">
                  <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5", getTrustBadgeColor(point.confidenceScore))}>
                    <Shield className="h-2.5 w-2.5 fill-current" /> %{point.confidenceScore} Güven
                  </Badge>

                  <Link
                    href={`/${point.citySlug}-${point.districtSlug}-${point.neighborhoodSlug}-kira-fiyatlari`}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent hover:underline"
                  >
                    Detaylar <Compass className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <Card className="absolute bottom-6 left-6 z-[1000] border-border/50 shadow-lg bg-background/95 backdrop-blur-sm max-w-xs">
        <CardContent className="p-3 text-[10px] space-y-2">
          <span className="font-bold text-foreground block">Medyan Kira Seviyeleri</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(350,89%,60%)] border border-white inline-block" />
              <span className="text-muted-foreground">30.000 TL Üstü (Yüksek)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(25,95%,53%)] border border-white inline-block" />
              <span className="text-muted-foreground">20.000 - 30.000 TL (Orta-Yüksek)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(142,71%,45%)] border border-white inline-block" />
              <span className="text-muted-foreground">10.000 - 20.000 TL (Orta)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(217,91%,60%)] border border-white inline-block" />
              <span className="text-muted-foreground">10.000 TL Altı (Düşük)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
