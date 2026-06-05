'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, Loader2, Check, X, RefreshCw, AlertTriangle, 
  ShieldCheck, Eye, Edit2, Trash2, FileDown, Search, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/analytics-engine';
import { cn } from '@/lib/utils';
import { PROPERTY_TYPES, ROOM_COUNTS, BUILDING_AGES } from '@/lib/constants';

export default function AdminVerilerPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');

  // Rejection Dialog State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Detail Dialog State
  const [detailReport, setDetailReport] = useState<any | null>(null);

  // Edit Dialog State
  const [editReport, setEditReport] = useState<any | null>(null);
  const [editRentAmount, setEditRentAmount] = useState<string>('');
  const [editDuesAmount, setEditDuesAmount] = useState<string>('');
  const [editNetSqm, setEditNetSqm] = useState<string>('');
  const [editRoomCount, setEditRoomCount] = useState<string>('');
  const [editPropertyType, setEditPropertyType] = useState<string>('');
  const [editBuildingAgeRange, setEditBuildingAgeRange] = useState<string>('');
  const [editHasElevator, setEditHasElevator] = useState<boolean>(false);
  const [editIsFurnished, setEditIsFurnished] = useState<boolean>(false);
  const [editIsInSite, setEditIsInSite] = useState<boolean>(false);
  const [editHasParking, setEditHasParking] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<string>('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  async function fetchCities() {
    try {
      const res = await fetch('/api/locations/cities');
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (err) {
      console.error('Cities load error:', err);
    }
  }

  async function fetchDistricts(cityId: string) {
    if (cityId === 'all') {
      setDistricts([]);
      setSelectedDistrictId('all');
      return;
    }
    try {
      const res = await fetch(`/api/locations/districts?cityId=${cityId}`);
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
        setSelectedDistrictId('all');
      }
    } catch (err) {
      console.error('Districts load error:', err);
    }
  }

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery.trim() !== '') params.append('search', searchQuery);
      if (selectedCityId !== 'all') params.append('cityId', selectedCityId);
      if (selectedDistrictId !== 'all') params.append('districtId', selectedDistrictId);

      const res = await fetch(`/api/admin/rent-reports?${params.toString()}`);
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

  // Initial load
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports();
  }, [filterStatus, selectedCityId, selectedDistrictId]);

  // Load districts when city changes
  useEffect(() => {
    fetchDistricts(selectedCityId);
  }, [selectedCityId]);

  function handleClearFilters() {
    setFilterStatus('all');
    setSearchQuery('');
    setSelectedCityId('all');
    setSelectedDistrictId('all');
  }

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

  function openEditModal(report: any) {
    setEditReport(report);
    setEditRentAmount(report.rentAmount.toString());
    setEditDuesAmount(report.duesAmount?.toString() || '');
    setEditNetSqm(report.netSqm.toString());
    setEditRoomCount(report.roomCount);
    setEditPropertyType(report.propertyType);
    setEditBuildingAgeRange(report.buildingAgeRange);
    setEditHasElevator(report.hasElevator);
    setEditIsFurnished(report.isFurnished);
    setEditIsInSite(report.isInSite);
    setEditHasParking(report.hasParking);
    setEditStatus(report.status);
  }

  async function handleEditSubmit() {
    if (!editReport) return;
    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/admin/rent-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editReport.id,
          status: editStatus,
          rentAmount: parseInt(editRentAmount) || undefined,
          duesAmount: editDuesAmount !== '' ? parseInt(editDuesAmount) : null,
          netSqm: parseInt(editNetSqm) || undefined,
          roomCount: editRoomCount,
          propertyType: editPropertyType,
          buildingAgeRange: editBuildingAgeRange,
          hasElevator: editHasElevator,
          isFurnished: editIsFurnished,
          isInSite: editIsInSite,
          hasParking: editHasParking,
        }),
      });

      if (res.ok) {
        toast.success('Kira kaydı başarıyla güncellendi.');
        setEditReport(null);
        fetchReports();
      } else {
        toast.error('Güncelleme gerçekleştirilemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası.');
    } finally {
      setSubmittingEdit(false);
    }
  }

  async function handleDeleteSubmit() {
    if (!deletingId) return;
    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/admin/rent-reports?id=${deletingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Kira kaydı kalıcı olarak silindi.');
        setDeletingId(null);
        fetchReports();
      } else {
        toast.error('Kayıt silinemedi.');
      }
    } catch {
      toast.error('Bağlantı hatası.');
    } finally {
      setSubmittingDelete(false);
    }
  }

  function exportToCSV() {
    if (reports.length === 0) {
      toast.error('Dışa aktarılacak veri bulunmamaktadır.');
      return;
    }

    const headers = [
      'ID', 'Il', 'Ilce', 'Mahalle', 'Konut Tipi', 'Oda Sayisi',
      'Net m2', 'Bina Yasi', 'Kira Bedeli', 'Aidat', 'Durum',
      'Guven Puani', 'IP Hash', 'Giris Tarihi'
    ];

    const rows = reports.map(r => [
      r.id,
      r.city.name,
      r.district.name,
      r.neighborhood.name,
      r.propertyType,
      r.roomCount,
      r.netSqm,
      r.buildingAgeRange,
      r.rentAmount,
      r.duesAmount || 0,
      r.status,
      r.trustScore,
      r.ipHash,
      new Date(r.createdAt).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kiralar_moderasyon_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-1.5 h-10 rounded-xl">
            <FileDown className="h-4 w-4" /> CSV Dışa Aktar
          </Button>
          <Button onClick={fetchReports} variant="outline" size="icon" className="h-10 w-10 rounded-xl">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <Card className="border-border/50 shadow-sm p-4 bg-muted/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Arama</Label>
            <div className="relative">
              <Input 
                placeholder="Mahalle, IP veya Kullanıcı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
                className="h-10 pr-8 bg-white"
              />
              <Button 
                onClick={fetchReports} 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* City Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">İl</Label>
            <Select value={selectedCityId} onValueChange={(val) => setSelectedCityId(val || 'all')}>
              <SelectTrigger className="h-10 bg-white">
                <SelectValue placeholder="Tüm İller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İller</SelectItem>
                {cities.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">İlçe</Label>
            <Select 
              value={selectedDistrictId} 
              onValueChange={(val) => setSelectedDistrictId(val || 'all')}
              disabled={selectedCityId === 'all'}
            >
              <SelectTrigger className="h-10 bg-white">
                <SelectValue placeholder="Tüm İlçeler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İlçeler</SelectItem>
                {districts.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status & Clear block */}
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-xs font-semibold text-muted-foreground">Statü</Label>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'all')}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Tüm Durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="flagged">Uç Değer / Flagli</SelectItem>
                  <SelectItem value="approved">Onaylılar</SelectItem>
                  <SelectItem value="rejected">Reddedilenler</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || selectedCityId !== 'all' || selectedDistrictId !== 'all' || filterStatus !== 'all') && (
              <Button onClick={handleClearFilters} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground shrink-0 rounded-xl" title="Filtreleri Temizle">
                <XCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <CardTitle className="text-base font-bold">Kira Bildirimleri Havuzu ({reports.length} Kayıt)</CardTitle>
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
                        <div className="flex justify-end gap-1.5">
                          {/* Details trigger */}
                          <Button
                            onClick={() => setDetailReport(report)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-white hover:bg-blue-600 border-blue-200"
                            title="İncele / Detaylar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Edit trigger */}
                          <Button
                            onClick={() => openEditModal(report)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-white hover:bg-amber-600 border-amber-200"
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

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

                          {/* Delete trigger */}
                          <Button
                            onClick={() => setDeletingId(report.id)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-white hover:bg-red-600 border-red-200"
                            title="Kalıcı Olarak Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Details Inspector Modal */}
      <Dialog open={!!detailReport} onOpenChange={(open) => !open && setDetailReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" /> Kira Raporu İnceleme
            </DialogTitle>
            <DialogDescription>
              Kayıt ID: {detailReport?.id}
            </DialogDescription>
          </DialogHeader>
          {detailReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 text-xs">
              {/* Left Column: Location & Lease */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm border-b pb-1">Lokasyon Bilgileri</h4>
                  <div><strong>İl:</strong> {detailReport.city.name}</div>
                  <div><strong>İlçe:</strong> {detailReport.district.name}</div>
                  <div><strong>Mahalle:</strong> {detailReport.neighborhood.name}</div>
                  {detailReport.approximateLat && (
                    <div><strong>Koordinat:</strong> {detailReport.approximateLat}, {detailReport.approximateLng}</div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm border-b pb-1">Kontrat & Ödeme</h4>
                  <div><strong>Kira Bedeli:</strong> {formatCurrency(detailReport.rentAmount)} / ay</div>
                  <div><strong>Aidat Bedeli:</strong> {detailReport.duesAmount ? `${detailReport.duesAmount} TL` : 'Girilmemiş'}</div>
                  <div><strong>Depozito:</strong> {detailReport.depositAmount ? `${detailReport.depositAmount} TL` : 'Girilmemiş'}</div>
                  <div><strong>Kontrat Başlangıcı:</strong> {detailReport.contractStartMonth ? `${detailReport.contractStartMonth}/${detailReport.contractStartYear}` : 'Girilmemiş'}</div>
                  <div><strong>Ödeme Türü:</strong> {detailReport.rentType === 'actual_paid' ? 'Fiilen Ödenen' : 'Yeni Sözleşme'}</div>
                </div>
              </div>

              {/* Right Column: Property Details & Moderation Info */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm border-b pb-1">Konut Özellikleri</h4>
                  <div><strong>Konut Tipi:</strong> <span className="capitalize">{detailReport.propertyType}</span></div>
                  <div><strong>Oda Sayısı:</strong> {detailReport.roomCount}</div>
                  <div><strong>Metrekare:</strong> {detailReport.netSqm} m² Net {detailReport.grossSqm ? `(${detailReport.grossSqm} m² Brüt)` : ''}</div>
                  <div><strong>Bina Yaşı:</strong> {detailReport.buildingAgeRange} yıl</div>
                  <div><strong>Kat:</strong> {detailReport.floorNumber || 'Girilmemiş'} / {detailReport.totalFloors || 'Girilmemiş'} ({detailReport.floorType})</div>
                  <div><strong>Isınma:</strong> <span className="capitalize">{detailReport.heatingType}</span></div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t mt-1 text-[10px]">
                    <div><strong>Asansör:</strong> {detailReport.hasElevator ? '✅ Var' : '❌ Yok'}</div>
                    <div><strong>Otopark:</strong> {detailReport.hasParking ? '✅ Var' : '❌ Yok'}</div>
                    <div><strong>Eşyalı:</strong> {detailReport.isFurnished ? '✅ Evet' : '❌ Hayır'}</div>
                    <div><strong>Site İçi:</strong> {detailReport.isInSite ? '✅ Evet' : '❌ Hayır'}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm border-b pb-1">Güvenilirlik & Moderasyon</h4>
                  <div className="flex items-center gap-2">
                    <strong>Güven Puanı:</strong> 
                    <Badge variant="outline" className={cn("font-bold", getTrustBadgeColor(detailReport.trustScore))}>
                      %{detailReport.trustScore}
                    </Badge>
                  </div>
                  <div><strong>Kaynak Güveni:</strong> <span className="capitalize font-semibold">{detailReport.dataSourceConfidence}</span></div>
                  <div><strong>IP Hash:</strong> {detailReport.ipHash}</div>
                  <div><strong>Giriş Tarihi:</strong> {new Date(detailReport.createdAt).toLocaleString('tr-TR')}</div>
                  <div><strong>Durum:</strong> <span className="capitalize font-bold text-slate-700">{detailReport.status}</span></div>
                  {detailReport.rejectedReason && (
                    <div className="text-rose-500 font-semibold mt-1">Red Nedeni: {detailReport.rejectedReason}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailReport(null)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Modal */}
      <Dialog open={!!editReport} onOpenChange={(open) => !open && setEditReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-amber-500" /> Kira Raporunu Düzenle
            </DialogTitle>
            <DialogDescription>
              Kayıt ID: {editReport?.id}
            </DialogDescription>
          </DialogHeader>
          {editReport && (
            <div className="space-y-4 py-4 text-xs">
              {/* Rent & Dues */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-rent" className="font-semibold">Aylık Kira (TL)</Label>
                  <Input 
                    id="edit-rent"
                    type="number"
                    value={editRentAmount}
                    onChange={(e) => setEditRentAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-dues" className="font-semibold">Aylık Aidat (TL)</Label>
                  <Input 
                    id="edit-dues"
                    type="number"
                    value={editDuesAmount}
                    onChange={(e) => setEditDuesAmount(e.target.value)}
                    placeholder="Yok veya girilmemiş"
                  />
                </div>
              </div>

              {/* Net Sqm & Room Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-sqm" className="font-semibold">Net Metrekare (m²)</Label>
                  <Input 
                    id="edit-sqm"
                    type="number"
                    value={editNetSqm}
                    onChange={(e) => setEditNetSqm(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">Oda Sayısı</Label>
                  <Select value={editRoomCount} onValueChange={(val) => setEditRoomCount(val || '')}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_COUNTS.map(rc => (
                        <SelectItem key={rc.value} value={rc.value}>{rc.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Property Type & Building Age */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Konut Tipi</Label>
                  <Select value={editPropertyType} onValueChange={(val) => setEditPropertyType(val || '')}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(pt => (
                        <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">Bina Yaşı</Label>
                  <Select value={editBuildingAgeRange} onValueChange={(val) => setEditBuildingAgeRange(val || '')}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILDING_AGES.map(ba => (
                        <SelectItem key={ba.value} value={ba.value}>{ba.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Features Switches */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="edit-elevator" 
                    checked={editHasElevator} 
                    onCheckedChange={(checked) => setEditHasElevator(!!checked)}
                  />
                  <Label htmlFor="edit-elevator" className="cursor-pointer">Asansör Var</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="edit-parking" 
                    checked={editHasParking} 
                    onCheckedChange={(checked) => setEditHasParking(!!checked)}
                  />
                  <Label htmlFor="edit-parking" className="cursor-pointer">Otopark Var</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="edit-furnished" 
                    checked={editIsFurnished} 
                    onCheckedChange={(checked) => setEditIsFurnished(!!checked)}
                  />
                  <Label htmlFor="edit-furnished" className="cursor-pointer">Eşyalı Konut</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="edit-site" 
                    checked={editIsInSite} 
                    onCheckedChange={(checked) => setEditIsInSite(!!checked)}
                  />
                  <Label htmlFor="edit-site" className="cursor-pointer">Site İçerisinde</Label>
                </div>
              </div>

              {/* Moderation Status */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="font-semibold text-slate-800">Veri Yayın Durumu</Label>
                <Select value={editStatus} onValueChange={(val) => setEditStatus(val || '')}>
                  <SelectTrigger className="bg-white font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede (İnceleniyor)</SelectItem>
                    <SelectItem value="approved">Onaylı (Yayında)</SelectItem>
                    <SelectItem value="rejected">Reddedildi (Yayından Kaldırıldı)</SelectItem>
                    <SelectItem value="flagged">Flagli / Şüpheli Uç Değer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReport(null)}>İptal</Button>
            <Button
              disabled={submittingEdit}
              onClick={handleEditSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {submittingEdit ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" /> Raporu Kalıcı Olarak Sil?
            </DialogTitle>
            <DialogDescription className="font-semibold text-rose-700">
              Dikkat! Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground leading-relaxed">
            Bu kira kaydını veri tabanından tamamen sileceksiniz. Bu silme işlemi sonucunda haritalar, sitemap'ler, medyan hesaplamaları ve istatistikler etkilenecektir.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>İptal</Button>
            <Button
              disabled={submittingDelete}
              onClick={handleDeleteSubmit}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {submittingDelete ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
