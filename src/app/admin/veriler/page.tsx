'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, ShieldAlert, Loader2, Check, X, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatNumber } from '@/lib/analytics-engine';
import { cn } from '@/lib/utils';

export default function AdminVerilerPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Rejection Dialog State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingReject, setSubmittingReject] = useState(false);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rent-reports?status=${filterStatus}`);
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
    fetchReports();
  }, [filterStatus]);

  async function handleApprove(id: string) {
    try {
      const res = await fetch('/api/admin/rent-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' }),
      });

      if (res.ok) {
        toast.success('Kira kaydı onaylandı ve yayına alındı.');
        fetchReports();
      } else {
        toast.error('İşlem gerçekleştirilemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası.');
    }
  }

  async function handleRejectSubmit() {
    if (!rejectingId) return;
    setSubmittingReject(true);
    try {
      const res = await fetch('/api/admin/rent-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rejectingId,
          status: 'rejected',
          rejectedReason: rejectReason || 'Spam veya hatalı veri girişi',
        }),
      });

      if (res.ok) {
        toast.success('Kira kaydı reddedildi.');
        setRejectingId(null);
        setRejectReason('');
        fetchReports();
      } else {
        toast.error('İşlem gerçekleştirilemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası.');
    } finally {
      setSubmittingReject(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20">Onaylı</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/10 border-rose-500/20">Reddedildi</Badge>;
      case 'flagged':
        return <Badge className="bg-rose-600/10 text-rose-600 hover:bg-rose-600/10 border-rose-600/20 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> Flagli (Uç değer)</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20">Beklemede</Badge>;
    }
  };

  const getTrustBadgeColor = (score: number) => {
    if (score >= 80) return 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5';
    if (score >= 60) return 'border-blue-500/20 text-blue-500 bg-blue-500/5';
    if (score >= 40) return 'border-amber-500/20 text-amber-500 bg-amber-500/5';
    return 'border-rose-500/20 text-rose-500 bg-rose-500/5';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-accent" />
            Kira Veri Moderasyonu
          </h2>
          <p className="text-xs text-muted-foreground">
            Sisteme yeni girilen ve incelenmesi gereken tüm kira bildirimlerini onaylayın veya reddedin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtresi">
                {filterStatus === 'all' ? 'Tüm Kayıtlar' :
                 filterStatus === 'pending' ? 'Beklemede' :
                 filterStatus === 'flagged' ? 'Uç Değer / Flagli' :
                 filterStatus === 'approved' ? 'Onaylılar' :
                 filterStatus === 'rejected' ? 'Reddedilenler' : 'Durum Filtresi'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kayıtlar</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="flagged">Uç Değer / Flagli</SelectItem>
              <SelectItem value="approved">Onaylılar</SelectItem>
              <SelectItem value="rejected">Reddedilenler</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchReports} variant="outline" size="icon">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <CardTitle className="text-base font-bold">Kira Bildirimleri Havuzu</CardTitle>
          <CardDescription className="text-xs">
            Listedeki beklemedeki verileri incelerken güven puanı ve uyarıları referans alabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-semibold text-sm">
              Seçilen kriterle eşleşen moderasyon kaydı bulunmamaktadır.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Konum</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Daire & Kira</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Kaynak / Güven</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Durum / Uyarılar</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground text-right">Aksiyonlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/10 transition-colors">
                      {/* Location */}
                      <TableCell className="py-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-foreground">{report.neighborhood.name}</span>
                          <span className="text-muted-foreground mt-0.5">{report.district.name}, {report.city.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">IP Hash: {report.ipHash.substring(0, 12)}</span>
                        </div>
                      </TableCell>

                      {/* Property Details */}
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <span className="capitalize">{report.propertyType}</span>
                            <span>•</span>
                            <span>{report.roomCount}</span>
                            <span>•</span>
                            <span>{report.netSqm} m²</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            Kira: <strong>{formatCurrency(report.rentAmount)}</strong> • Aidat: {report.duesAmount ? `${report.duesAmount} TL` : '-'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Tip: {report.rentType === 'actual_paid' ? 'Ödenen' : report.rentType === 'new_contract' ? 'Yeni Kontrat' : 'İlan'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Trust & Source */}
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={cn("text-[10px] font-bold px-1.5 py-0", getTrustBadgeColor(report.trustScore))}>
                              %{report.trustScore} Güven
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            Kaynak: <span className="capitalize font-semibold">{report.dataSourceConfidence}</span>
                          </span>
                        </div>
                      </TableCell>

                      {/* Status / Warnings */}
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start text-xs">
                          {getStatusBadge(report.status)}
                          {report.rejectedReason && (
                            <span className="text-[10px] text-rose-500 font-medium max-w-[200px] truncate" title={report.rejectedReason}>
                              Nedeni: {report.rejectedReason}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {report.status !== 'approved' && (
                            <Button
                              onClick={() => handleApprove(report.id)}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-white hover:bg-emerald-600 border-emerald-200"
                              title="Onayla"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status !== 'rejected' && (
                            <Button
                              onClick={() => setRejectingId(report.id)}
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200"
                              title="Reddet"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kira Verisini Reddet</DialogTitle>
            <DialogDescription>
              Bu kira kaydını yayından kaldırmak / reddetmek üzeresiniz. Lütfen bir gerekçe belirtin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label htmlFor="reason">Reddetme Gerekçesi</Label>
            <Input
              id="reason"
              placeholder="Örn: Uç değer / tutarsız aidat / spam şüphesi"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>İptal</Button>
            <Button
              disabled={submittingReject}
              onClick={handleRejectSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {submittingReject ? 'İşleniyor...' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
