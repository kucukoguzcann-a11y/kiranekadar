import type { Metadata } from 'next';
import { Shield, BarChart3, Calculator, HelpCircle, CheckCircle, Scale, Database, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Veri Metodolojisi | KiraNeKadar',
  description: 'KiraNeKadar verilerinin nasıl toplandığı, filtrelendiği, güven skorunun hesaplandığı ve medyan kira hesaplama yöntemleri hakkında şeffaf bilgilendirme.',
};

export default function MetodolojiPage() {
  const sections = [
    {
      icon: Database,
      title: 'KiraNeKadar Verileri Nasıl Toplanır?',
      content: 'Verilerimiz tamamen platformu kullanan gerçek kullanıcıların ödediği veya yeni kontrat yaptığı kira bedellerini bildirmesi yoluyla toplanır. Herhangi bir ilan sitesinden fiyat çekilmez; sadece "ödenen/anlaşılan gerçek tutarlar" toplanarak veri havuzumuz oluşturulur.',
    },
    {
      icon: Shield,
      title: 'Anonim Kira Bildirimi & İstenen Bilgiler',
      content: 'Anonim kira bildirimi, kullanıcıların kimliklerini ifşa etmeden kira verisi paylaşabilmelerini sağlar. Bildirim sırasında sadece İl, İlçe, Mahalle, Aylık Kira, Daire Tipi (oda sayısı), Net m², Isınma Tipi, Bina Yaşı ve varsa bazı ek özellikler istenir. Kullanıcılardan isim, telefon, e-posta veya TC Kimlik numarası talep edilmez.',
    },
    {
      icon: Shield,
      title: 'Açık Adres Neden İstenmez?',
      content: 'Kişisel verilerin korunması ve gizliliğin tam sağlanması amacıyla açık adres talep etmiyoruz. Kira bildirimleri en fazla mahalle düzeyinde eşleştirilir ve haritada sadece yaklaşık konumlarla (mahalle geneli) temsil edilir. Böylece paylaşılan verinin hangi spesifik daireye ait olduğu asla tespit edilemez.',
    },
    {
      icon: CheckCircle,
      title: 'Güven Skoru (Trust Score) Nedir?',
      content: 'Her kira bildirimi sisteme kaydedildiğinde otomatik bir "Güven Skoru" süzgecinden geçer. Bu skor; verinin girildiği IP adresi, oturum bilgileri, konum doğruluğu ve o bölgedeki tarihsel kira trendlerine yakınlığı gibi istatistiksel faktörlerle 0 ile 100 arasında hesaplanır. Güven skoru 60\'ın altındaki veriler analizlere dahil edilmez.',
    },
    {
      icon: Scale,
      title: 'Uç Değerler (Outliers) Nasıl Filtrelenir?',
      content: 'Yanlış, hatalı veya kasıtlı olarak çok yüksek/düşük girilen verileri temizlemek için "Double IQR (Interquartile Range)" ve standart sapma filtreleri kullanıyoruz. Bölge ortalamasının ve medyan değerinin aşırı dışındaki (örneğin normalde 15.000 TL olan bir mahallede girilen 150.000 TL veya 1.500 TL gibi) uç veriler otomatik olarak elenir.',
    },
    {
      icon: BarChart3,
      title: 'Neden Medyan Kira Kullanılır?',
      content: 'Aritmetik ortalama, aşırı uç değerlerden (çok lüks veya çok bakımsız az sayıda daireden) kolayca etkilenir ve sapar. Medyan (ortanca değer), tüm veriler küçükten büyüğe sıralandığında tam ortada kalan değerdir. Bu nedenle mahallelerin genel kira seviyesini yansıtmakta medyan kira çok daha dengeli ve gerçekçidir.',
    },
    {
      icon: Calculator,
      title: 'm² Kira Bedeli Nasıl Hesaplanır?',
      content: 'Bildirilen dairenin aylık net kira bedeli, bildirilen net metrekareye bölünerek m² başına birim kira bedeli elde edilir. Bölge genelindeki m² kira değeri ise o bölgede onaylanan tüm bildirimlerin m² başına düşen kiralarının medyanı alınarak hesaplanır.',
    },
    {
      icon: HelpCircle,
      title: 'Düşük Veri Uyarısı Ne Anlama Gelir?',
      content: 'Bir mahalle veya ilçede onaylanmış veri sayısı 1 ile 4 arasındaysa, o bölge sayfasında "Temsil gücü sınırlı" uyarısı gösterilir. Bu, gösterilen fiyat verisinin istatistiksel olarak henüz tam doğruluğu yansıtmayabileceğini, veri sayısı arttıkça güvenilirliğin artacağını belirtir.',
    },
    {
      icon: Clock,
      title: 'Son Güncelleme Tarihi Nasıl Belirlenir?',
      content: 'Her lokasyon (il, ilçe, mahalle) sayfasındaki "Son Güncelleme" bilgisi, o lokasyon için girilen ve moderasyon ekibimiz/algoritmamız tarafından son onaylanan (approved) verinin onaylandığı tarihi gösterir. Böylece verilerin ne kadar güncel olduğunu izleyebilirsiniz.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            KiraNeKadar <span className="text-emerald-600">Veri Metodolojisi</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Kira verilerini nasıl topladığımızı, hangi filtrelerden geçirdiğimizi ve nasıl analiz ettiğimizi şeffaf bir şekilde açıklıyoruz.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0 w-12 h-12 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">{section.title}</h2>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advisory Disclaimer */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 md:p-8 flex items-start gap-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-amber-900 text-base">Önemli Yasal Uyarı</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              KiraNeKadar üzerinde sunulan analizler, grafikler, ortalama ve medyan kira verileri sadece kullanıcıların anonim beyanlarına dayalı bilgilendirme amaçlıdır. 
              Bu veriler resmi bir gayrimenkul değerlemesi, resmi ekspertiz raporu veya finansal/yatırım tavsiyesi niteliği taşımaz. 
              Taşınma, kiralama veya satın alma kararlarınızda resmi kurum ve lisanslı gayrimenkul danışmanlarının görüşlerini de almanız tavsiye edilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
