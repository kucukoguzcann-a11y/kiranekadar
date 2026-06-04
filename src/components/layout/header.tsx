'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, PlusCircle, Menu, User, LogOut, Shield, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LocationSelector from '@/components/forms/location-selector';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  user?: { email: string; role: string; name?: string } | null;
}

const navLinks = [
  { href: '/kira-fiyatlari', label: 'Kira Fiyatları' },
  { href: '/harita', label: 'Kira Haritası' },
  { href: '/karsilastir', label: 'Kira Karşılaştırma' },
  { href: '/analiz', label: 'Kira Analizi Yap' },
];

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Kira Anonim Bildir Modal States
  const [showPreFormModal, setShowPreFormModal] = useState(false);
  const [cityId, setCityId] = useState<number>(0);
  const [districtId, setDistrictId] = useState<number>(0);
  const [neighborhoodId, setNeighborhoodId] = useState<number>(0);
  const [rentAmount, setRentAmount] = useState<string>('');

  // Kira Analizi Yap Modal States
  const [showAnalizModal, setShowAnalizModal] = useState(false);
  const [analizCityId, setAnalizCityId] = useState<number>(0);
  const [analizDistrictId, setAnalizDistrictId] = useState<number>(0);
  const [analizNeighborhoodId, setAnalizNeighborhoodId] = useState<number>(0);

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || 'U';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for anonymous report modal trigger
      if (urlParams.get('show-report-modal') === 'true') {
        setShowPreFormModal(true);
        urlParams.delete('show-report-modal');
        const cleanPath = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState(null, '', cleanPath);
      }

      // Check for analyze modal trigger
      if (urlParams.get('show-analiz-modal') === 'true') {
        setShowAnalizModal(true);
        urlParams.delete('show-analiz-modal');
        const cleanPath = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState(null, '', cleanPath);
      }

      const handleOpenReportModal = () => {
        setShowPreFormModal(true);
      };
      
      const handleOpenAnalizModal = () => {
        setShowAnalizModal(true);
      };

      window.addEventListener('open-kira-bildir-modal', handleOpenReportModal);
      window.addEventListener('open-kira-analiz-modal', handleOpenAnalizModal);

      return () => {
        window.removeEventListener('open-kira-bildir-modal', handleOpenReportModal);
        window.removeEventListener('open-kira-analiz-modal', handleOpenAnalizModal);
      };
    }
  }, []);

  const handlePreFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId || !districtId || !neighborhoodId) {
      alert('Lütfen il, ilçe ve mahalle seçin.');
      return;
    }
    
    const params = new URLSearchParams();
    params.append('cityId', String(cityId));
    params.append('districtId', String(districtId));
    params.append('neighborhoodId', String(neighborhoodId));
    if (rentAmount) {
      params.append('rentAmount', rentAmount);
    }
    
    setShowPreFormModal(false);
    
    // Reset modal inputs
    setCityId(0);
    setDistrictId(0);
    setNeighborhoodId(0);
    setRentAmount('');
    
    router.push(`/veri-gir?${params.toString()}`);
  };

  const handleAnalizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analizCityId) {
      alert('Lütfen en azından bir il seçin.');
      return;
    }
    
    const params = new URLSearchParams();
    params.append('cityId', String(analizCityId));
    if (analizDistrictId) {
      params.append('districtId', String(analizDistrictId));
    }
    if (analizNeighborhoodId) {
      params.append('neighborhoodId', String(analizNeighborhoodId));
    }
    
    setShowAnalizModal(false);
    
    // Reset modal inputs
    setAnalizCityId(0);
    setAnalizDistrictId(0);
    setAnalizNeighborhoodId(0);
    
    router.push(`/analiz?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Kira<span className="text-emerald-600">NeKadar</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-150 hover:text-gray-900 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth/CTA */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg h-9 px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-emerald-100 text-[10px] text-emerald-700 font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm max-w-[120px] truncate font-medium">{user.name || user.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 shadow-lg rounded-xl p-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                <DropdownMenuItem asChild className="rounded-lg text-sm text-gray-700 cursor-pointer">
                  <Link href="/profil" className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4" /> Profilim
                  </Link>
                </DropdownMenuItem>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <DropdownMenuItem asChild className="rounded-lg text-sm text-gray-700 cursor-pointer">
                    <Link href="/admin" className="flex items-center gap-2 w-full">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                <DropdownMenuItem asChild className="rounded-lg text-sm text-red-600 cursor-pointer">
                  <Link href="/api/auth/signout" className="flex items-center gap-2 w-full">
                    <LogOut className="h-4 w-4" /> Çıkış Yap
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-9 px-4">
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button
                onClick={() => setShowPreFormModal(true)}
                className="h-9 px-4 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-200 transition-all hover:shadow-md hover:shadow-emerald-200 cursor-pointer"
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Kirayı Anonim Bildir
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Menüyü aç"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 truncate">{user.email}</div>
                  <Link
                    href="/profil"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" /> Profilim
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış Yap
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start text-gray-700 hover:bg-gray-50 font-medium">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      setShowPreFormModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Kirayı Anonim Bildir
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preliminary Information Dialog */}
      <Dialog open={showPreFormModal} onOpenChange={setShowPreFormModal}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 text-left">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight">
              Kirayı Anonim Bildir
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Kira bildirim sihirbazına geçmeden önce lütfen temel bilgilerinizi girin. Bu bilgiler formda otomatik olarak doldurulacaktır.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePreFormSubmit} className="space-y-4 my-2">
            {/* Location Selector */}
            <LocationSelector
              className="flex flex-col gap-4"
              cityId={cityId}
              districtId={districtId}
              neighborhoodId={neighborhoodId}
              onCityChange={(id) => {
                setCityId(id);
                setDistrictId(0);
                setNeighborhoodId(0);
              }}
              onDistrictChange={(id) => {
                setDistrictId(id);
                setNeighborhoodId(0);
              }}
              onNeighborhoodChange={(id) => {
                setNeighborhoodId(id);
              }}
            />

            {/* Rent Amount Input */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="pre-rent" className="text-xs font-semibold text-gray-600">
                Aylık Kira Bedeli (TL)
              </Label>
              <Input
                id="pre-rent"
                type="number"
                placeholder="Örn: 20000"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="w-full text-sm bg-gray-50 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 rounded-xl h-10 transition-colors"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={!cityId || !districtId || !neighborhoodId}
                className="w-full h-11 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Devam Et ve Bildir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Kira Analizi Yap Dialog */}
      <Dialog open={showAnalizModal} onOpenChange={setShowAnalizModal}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 text-left">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight">
              Kira Analizi Yap
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Analiz etmek istediğiniz bölgeyi seçin. Seçtiğiniz bölgeye ait detaylı veriler gösterilecektir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAnalizSubmit} className="space-y-4 my-2">
            {/* Location Selector */}
            <LocationSelector
              className="flex flex-col gap-4"
              cityId={analizCityId}
              districtId={analizDistrictId}
              neighborhoodId={analizNeighborhoodId}
              onCityChange={(id) => {
                setAnalizCityId(id);
                setAnalizDistrictId(0);
                setAnalizNeighborhoodId(0);
              }}
              onDistrictChange={(id) => {
                setAnalizDistrictId(id);
                setAnalizNeighborhoodId(0);
              }}
              onNeighborhoodChange={(id) => {
                setAnalizNeighborhoodId(id);
              }}
            />

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={!analizCityId}
                className="w-full h-11 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Bölgeyi Analiz Et
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
