export const PROPERTY_TYPES = [
  { value: 'daire', label: 'Daire' },
  { value: 'rezidans', label: 'Rezidans' },
  { value: 'mustakil', label: 'Müstakil Ev' },
  { value: 'villa', label: 'Villa' },
  { value: 'studyo', label: 'Stüdyo' },
  { value: 'apart', label: 'Apart' },
] as const;

export const ROOM_COUNTS = [
  { value: '1+0', label: '1+0' },
  { value: '1+1', label: '1+1' },
  { value: '2+1', label: '2+1' },
  { value: '3+1', label: '3+1' },
  { value: '4+1', label: '4+1' },
  { value: '5+1', label: '5+1 ve üzeri' },
] as const;

export const BUILDING_AGES = [
  { value: '0', label: '0 (Sıfır)' },
  { value: '1-5', label: '1-5 Yıl' },
  { value: '6-10', label: '6-10 Yıl' },
  { value: '11-15', label: '11-15 Yıl' },
  { value: '16-20', label: '16-20 Yıl' },
  { value: '21-30', label: '21-30 Yıl' },
  { value: '30+', label: '30+ Yıl' },
] as const;

export const FLOOR_TYPES = [
  { value: 'bahce', label: 'Bahçe Katı' },
  { value: 'giris', label: 'Giriş Kat' },
  { value: '1', label: '1. Kat' },
  { value: '2', label: '2. Kat' },
  { value: '3', label: '3. Kat' },
  { value: '4', label: '4. Kat' },
  { value: '5', label: '5. Kat' },
  { value: 'ara', label: 'Ara Kat' },
  { value: 'en_ust', label: 'En Üst Kat' },
  { value: 'cati_dubleks', label: 'Çatı Dubleks' },
] as const;

export const HEATING_TYPES = [
  { value: 'kombi', label: 'Kombi' },
  { value: 'merkezi', label: 'Merkezi' },
  { value: 'klima', label: 'Klima' },
  { value: 'soba', label: 'Soba' },
  { value: 'yerden', label: 'Yerden Isıtma' },
  { value: 'diger', label: 'Diğer' },
] as const;

export const RENT_TYPES = [
  { value: 'actual_paid', label: 'Gerçek Ödenen Kira', description: 'Şu an ödediğim kira' },
  { value: 'new_contract', label: 'Yeni Kontrat Kirası', description: 'Yeni imzalanan kontrat' },
  { value: 'old_contract', label: 'Eski Kontrat Kirası', description: 'Eski kontrat devam ediyor' },
  { value: 'asking_price', label: 'İlan/Talep Edilen Fiyat', description: 'İlanda gördüğüm fiyat' },
  { value: 'estimated', label: 'Tahmini Bilgi', description: 'Kesin bilgim yok, tahmin' },
] as const;

export const DATA_SOURCE_TYPES = [
  { value: 'self', label: 'Kendi oturduğum ev', icon: '🏠', trustBonus: 20 },
  { value: 'close_contact', label: 'Yakınımdan biliyorum', icon: '👥', trustBonus: 10 },
  { value: 'realtor', label: 'Emlakçı bilgisi', icon: '🏢', trustBonus: 5 },
  { value: 'listing', label: 'İlan/duyum', icon: '📋', trustBonus: -5 },
  { value: 'estimate', label: 'Tahmini', icon: '🤔', trustBonus: -15 },
] as const;

export const REPORT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: 'yellow' },
  approved: { label: 'Onaylı', color: 'green' },
  rejected: { label: 'Reddedildi', color: 'red' },
  flagged: { label: 'İşaretli', color: 'orange' },
};

export const TRUST_SCORE_LEVELS = [
  { min: 80, max: 100, label: 'Yüksek Güven', color: 'hsl(142, 71%, 45%)', bgColor: 'hsl(142, 71%, 95%)' },
  { min: 60, max: 79, label: 'Orta Güven', color: 'hsl(217, 91%, 60%)', bgColor: 'hsl(217, 91%, 95%)' },
  { min: 40, max: 59, label: 'Düşük Güven', color: 'hsl(25, 95%, 53%)', bgColor: 'hsl(25, 95%, 95%)' },
  { min: 0, max: 39, label: 'Moderasyon Gerekli', color: 'hsl(0, 84%, 60%)', bgColor: 'hsl(0, 84%, 95%)' },
] as const;

export const MIN_DATA_THRESHOLDS = {
  neighborhood: 5,
  district: 20,
  city: 50,
} as const;

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
] as const;
