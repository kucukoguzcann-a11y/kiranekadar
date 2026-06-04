'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Database, ShieldAlert, Loader2, RefreshCw, Trash2, ArrowRight, Home, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatNumber } from '@/lib/analytics-engine';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  async function fetchUserProfile() {
    try {
      const res = await fetch('/api/auth/me'); // Wait, let's see if we have an /api/auth/me endpoint.
      // If we don't have it, we can read the cookie or mock it from localstorage/cookie.
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (err) {
      console.error('User profile load error:', err);
    }
  }

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/rent-reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Veriler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Attempt to load profile from document.cookie as fallback
    const match = document.cookie.match(/(^| )kira-auth=([^;]+)/);
    if (match) {
      try {
        const userObj = JSON.parse(decodeURIComponent(match[2]));
        setUserProfile(userObj);
      } catch {
        setUserProfile(null);
      }
    }
    fetchReports();
  }, []);

  const handleOpenReportModal = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-kira-bildir-modal'));
  };

  async function handleDelete(id: string) {
    if (!confirm('Bu kira bildirimini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    try {
      const res = await fetch(`/api/rent-reports/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Kira bildirimi silindi.');
        fetchReports();
      } else {
        toast.error('İşlem gerçekleştirilemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası.');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20">Onaylandı (Yayınlanıyor)</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/10 border-rose-500/20">Reddedildi</Badge>;
      case 'flagged':
        return <Badge className="bg-rose-600/10 text-rose-600 hover:bg-rose-600/10 border-rose-600/20">Flagli (Uç Değer)</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20">Beklemede (İnceleniyor)</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8 animate-fade-in">
        
        {/* User Card Header */}
        <Card className="border-border/50 shadow-sm relative overflow-hidden bg-primary text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 border-2 border-accent">
                <User className="h-7 w-7 text-accent" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{userProfile?.name || 'Kullanıcı'}</h2>
                <p className="text-xs text-white/60">{userProfile?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] text-accent border-accent/40 bg-accent/5 font-bold uppercase tracking-wider">
                    {userProfile?.role === 'admin' ? 'Yönetici' : userProfile?.role === 'moderator' ? 'Moderatör' : 'Üye'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleOpenReportModal}
                variant="outline"
                className="border-white/10 hover:bg-white/10 text-white text-xs gap-1.5 cursor-pointer"
              >
                Kira Bildir <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              {userProfile?.role === 'admin' && (
                <Button asChild className="bg-accent hover:bg-accent/90 text-white text-xs">
                  <Link href="/admin">Yönetim Paneli</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Submissions Table */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Database className="h-4 w-4 text-accent" />
                Girdiğim Kira Verileri
              </CardTitle>
              <CardDescription className="text-xs">
                Sistemde kayıtlı olan ve moderatör incelemesindeki tüm veri girişleriniz
              </CardDescription>
            </div>
            <Button onClick={fetchReports} variant="outline" size="icon" className="h-8 w-8">
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-accent animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-semibold text-sm space-y-4">
                <p>Henüz sisteme bir kira veri girişi yapmadınız.</p>
                <Button
                  onClick={handleOpenReportModal}
                  className="bg-accent hover:bg-accent/90 text-white text-xs cursor-pointer"
                >
                  Hemen Veri Gir
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-muted-foreground">Konum</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">Özellikler & Kira</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">Durum / Bildirim</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground text-right">Eylemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-muted/5 transition-colors">
                        {/* Location */}
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-foreground">{report.neighborhood.name}</span>
                            <span className="text-muted-foreground mt-0.5">{report.district.name}, {report.city.name}</span>
                          </div>
                        </TableCell>

                        {/* Specs */}
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <div className="flex items-center gap-1 font-semibold text-foreground">
                              <span className="capitalize">{report.propertyType}</span>
                              <span>•</span>
                              <span>{report.roomCount}</span>
                              <span>•</span>
                              <span>{report.netSqm} m²</span>
                            </div>
                            <span className="text-[10px] text-accent font-bold mt-0.5">
                              {formatCurrency(report.rentAmount)} / ay
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5 items-start text-xs">
                            {getStatusBadge(report.status)}
                            {report.rejectedReason && (
                              <span className="text-[9px] text-rose-500 font-medium">
                                Red Nedeni: {report.rejectedReason}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleDelete(report.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-white hover:bg-rose-500"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KVKK / Privacy Info */}
        <div className="flex gap-3 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <h4 className="text-xs font-semibold text-foreground">KiraNeKadar Anonimlik Garantisi</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Paylaştığınız kira kayıtları moderatörler tarafından incelendikten sonra isim ve hesap bilginizden arındırılarak genel analiz havuzuna eklenir. Diğer kullanıcılar profilinizi veya tam daire numaranızı asla göremez.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
