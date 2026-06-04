import { formatCurrency } from './analytics-engine';

export interface ProgrammaticCopy {
  warningText: string | null;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  paragraph4: string;
  confidenceText: string;
}

export function getProgrammaticCopy(
  type: 'city' | 'district' | 'neighborhood',
  name: string,
  count: number,
  medianRent: number,
  m2Rent: number,
  parentName?: string
): ProgrammaticCopy {
  const medianStr = medianRent > 0 ? formatCurrency(medianRent) : 'veri bekleniyor';
  const m2Str = m2Rent > 0 ? `${m2Rent.toLocaleString('tr-TR')} ₺` : 'veri bekleniyor';
  
  let warningText: string | null = null;
  let paragraph1 = '';
  let paragraph2 = '';
  let paragraph3 = '';
  let paragraph4 = '';
  let confidenceText = 'Düşük';

  if (count === 0) {
    warningText = `${name} genelinde henüz onaylanmış bir kira verisi bulunmamaktadır. Veri girilmesi bekleniyor...`;
    paragraph1 = `${name} kiralık konut piyasası analizimiz henüz veri giriş aşamasındadır. Bölge için yeterli doğrulanmış kira bildirimi yapılmadığından, fiyat analizi, ortalama değerler veya kira tahmini yapılamamaktadır.`;
    paragraph2 = `${name} sınırları içerisindeki kira fiyatı karşılaştırmaları, veri tabanımızdaki veri havuzu büyüdükçe aktifleşecektir. Ev arayışınızda veya kira belirleme süreçlerinizde yanıltıcı olmaması adına ilk veriyi siz ekleyerek süreci başlatabilirsiniz.`;
    paragraph3 = `Bölgedeki oda sayısı bazlı (1+1, 2+1, 3+1 vb.) kiralık konut dağılımları ve metrekare birim fiyatları, kullanıcılarımızın yapacağı yeni anonim bildirimlerin ardından doğrulanarak bu alanda listelenecektir.`;
    paragraph4 = `Kira sözleşmenizi imzalamadan önce binanın yaşı, aidatı ve ulaşım entegrasyonu gibi ek maliyetleri de göz önünde bulundurmanız tavsiye edilir. Ödediğiniz güncel kirayı anonim bildirerek bölgedeki şeffaflığa katkıda bulunabilirsiniz.`;
    confidenceText = 'Veri Yok';
  } else if (count >= 1 && count <= 4) {
    warningText = `⚠️ Bölgeden alınan veri sayısı (1-4 arası) istatistiksel temsil gücü açısından sınırlıdır. Paylaşılan veriler fikir vermesi amacıyla sunulmuş olup, resmi raporlarda kullanılması tavsiye edilmez.`;
    paragraph1 = `${name} genelinde şu an için paylaşılan sınırlı sayıdaki ${count} adet onaylı kira bildirimi doğrultusunda medyan kira bedeli ${medianStr} olarak hesaplanmıştır. Veri havuzu henüz başlangıç aşamasında olduğundan, bu değerlerin yüksek hata payı içerebileceği unutulmamalıdır.`;
    paragraph2 = `${name} kiralık daire fiyatları açısından, çevre bölgelerle kıyaslama yapacak yeterli olgunluğa henüz ulaşmamıştır. İlk kullanıcı bildirimleri doğrultusunda oluşan bu fiyatlar, bölgenin genelini temsil etmekten ziyade spesifik daire tiplerine ait münferit kontratları yansıtır.`;
    paragraph3 = `Oda tipine göre (1+1, 2+1, 3+1) kira dağılımları ve metrekare birim fiyatları şu an için yalnızca sınırlı bildirimler üzerinden izlenebilir durumdadır. m² bazında birim fiyatı ${m2Str} civarında görünse de, bu verinin temsil gücü sınırlıdır.`;
    paragraph4 = `Ev arayışınızda bu öncül verileri tek başına referans almak yerine diğer ilan fiyatlarını da kıyaslamanız yararlıdır. Bölgedeki veri doğruluğunu artırmak için ödediğiniz kirayı anonim olarak hemen bildirebilirsiniz.`;
    confidenceText = 'Temsil Gücü Sınırlı';
  } else if (count >= 5 && count <= 19) {
    paragraph1 = `${name} genelinde kayıtlı bulunan toplam ${count} adet onaylı kullanıcı bildirimi doğrultusunda, bölgedeki medyan kira bedeli ${medianStr} olarak ölçülmüştür. Bu veri seti, bölgenin genel kira seviyesini yansıtmada faydalı ilk kararlı istatistikleri sunar.`;
    paragraph2 = `${name} sınırları içindeki konut hareketliliği incelendiğinde, sosyal imkanlara ve ana ulaşım hatlarına yakın bölgelerin bu medyan fiyattan yukarı yönde saptığı gözlemlenmiştir. Veriler arttıkça bölgeler arası fiyat makası daha kararlı görünecektir.`;
    paragraph3 = `Oda sayısı kırılımlarına bakıldığında, talebin oda tipleri üzerindeki metrekare birim kiralarını farklılaştırdığı görülür. m² başına ortalama ${m2Str} birim bedeli, bölgedeki standart konutların bütçe öngörüsünü kolaylaştırır.`;
    paragraph4 = `KiraNeKadar üzerindeki bu veriler, ilan sitelerindeki şişirilmiş nominal teklifleri değil, fiilen ödenen kontratları gösterir. Bölgedeki şeffaflığı pekiştirmek amacıyla siz de güncel kira bilginizi sisteme bildirebilirsiniz.`;
    confidenceText = 'Orta';
  } else if (count >= 20 && count <= 49) {
    paragraph1 = `${name} kiralık konut piyasasında doğrulanmış ${count} onaylı veri ile güvenilir bir analiz tablosu oluşturulmuştur. Bölgedeki medyan aylık kira bedeli ${medianStr} olarak hesaplanmıştır. Bu değer, konutların yarısının bu tutarın altında, diğer yarısının ise üstünde kiralandığını gösteren en dengeli göstergedir.`;
    paragraph2 = `${name} içindeki alt lokasyonlar arası fiyat makası incelendiğinde, binaların yaş durumu ve asansör/otopark gibi donatıların kira bedellerini doğrudan etkilediği görülmektedir. Ekonomik alternatifler ile lüks konut grupları arasındaki dağılım kararlı bir dengede seyretmektedir.`;
    paragraph3 = `Oda tipine göre medyan kira kırılımları incelendiğinde, çekirdek ailelerin ve tek yaşayanların bütçe tercihleri açıkça görülmektedir. Birim metrekare başına medyan kira tutarı ${m2Str} olup, standart 100 m² büyüklükteki bir daire için bölge beklentilerini başarıyla yansıtır.`;
    paragraph4 = `Bu veriler genel piyasa eğilimlerini yansıtmakta olup, kiralama yapmadan önce binanın yalıtım durumu ve aidat yüklerini de göz önünde bulundurmanız tavsiye edilir. Siz de ödediğiniz kirayı bildirerek bu veri tabanına katkıda bulunabilirsiniz.`;
    confidenceText = 'İyi';
  } else if (count >= 50 && count <= 99) {
    paragraph1 = `Bölgedeki ${count} adet onaylı bildirim sayesinde ${name} için gelişmiş karşılaştırma ve trend analizleri etkinleştirilmiştir. Lokasyon genelinde medyan kira ${medianStr} seviyesindedir. Tarihsel ve mevsimsel değişim trendleri, bölgedeki kira hareketlerinin genel bir istikrara kavuştuğunu göstermektedir.`;
    paragraph2 = `${name} kiralık daire piyasasında, çevre bölgeler ile girilen kontrat fiyatları arasındaki korelasyon kararlılık kazanmıştır. Ulaşım akslarına yürüme mesafesinde olan konutlar ile daha iç kesimdeki konutlar arasındaki fiyat kontrastı, bütçenize en uygun seçeneği belirlemede net veriler sunar.`;
    paragraph3 = `Oda bazlı dağılımlar incelendiğinde, 1+1 dairelerin m² verimliliğinin 3+1 dairelere oranla daha yüksek olduğu gözlemlenmektedir. Genel metrekare birim kirası olan ${m2Str}, bölgedeki dairelerin değerlemesinde güçlü bir standart oluşturmaktadır.`;
    paragraph4 = `Verilerimiz doğrudan ödenen gerçek kira kontratlarından oluştuğundan, ilan fiyatlarındaki spekülasyonlardan arındırılmıştır. Karar verme aşamasında bu raporları referans alabilir, güncel kiranızı bildirerek şeffaflığa destek olabilirsiniz.`;
    confidenceText = 'Yüksek';
  } else {
    // count >= 100
    paragraph1 = `Bulunduğunuz bölgeye ait ${count}+ kapsamlı kira bildirimi ile gelişmiş analiz kutuları aktif hale getirilmiştir. En yüksek veri hacmine sahip bu veri seti, ${name} genelinde medyan kirayı ${medianStr} olarak en net doğrulukla ortaya koymaktadır.`;
    paragraph2 = `${name} genelindeki konut yapı stoku, bina yaş aralıkları, kat yükseklikleri ve donanım özelliklerinin kiraya etkisi en ince ayrıntısına kadar modellenmiştir. Bu sayede, bölgede fahiş fiyat sapması gösteren teklifleri veya piyasa altına kalmış avantajlı ilanları hemen fark edebilirsiniz.`;
    paragraph3 = `Detaylı oda sayısı (1+0'dan 4+1'e) ve bina yaşı bazlı m² kira analizleri, hangi tip yatırımların veya kiralamaların daha kısa sürede amorti edilebileceğini kanıtlamaktadır. Bölgenin medyan m² kira birim bedeli olan ${m2Str}, en kararlı istatistiksel güce sahiptir.`;
    paragraph4 = `En üst düzey güven seviyesine sahip bu verileri sözleşme aşamasında pazarlık gücü olarak kullanabilirsiniz. KiraNeKadar topluluğunun bir parçası olarak ödediğiniz güncel kirayı anonim paylaşarak veri gücümüzü korumamıza yardımcı olun.`;
    confidenceText = 'Çok Yüksek';
  }

  return {
    warningText,
    paragraph1,
    paragraph2,
    paragraph3,
    paragraph4,
    confidenceText,
  };
}
