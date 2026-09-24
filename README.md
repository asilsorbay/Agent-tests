# Agent Tests

Yapay zekâ modellerine tek bir promptla yaptırdığım simülasyon testleri. Amaç modelin kapasitesini görmek: Promptu ben veriyorum, kodun tamamını model yazıyor. Bundan sonra yapacağım testlerin hepsi buraya eklenecek.

Promptları bilerek kısa tutuyorum. Amaç modele fikri vermek, nasıl yapacağını ona bırakmak.

## Düzen

```
Claude/<Proje>/   Claude'un yaptığı testler
Codex/<Proje>/    Codex'in yaptığı testler
```

Her proje klasöründe:

- `index.html`: Projenin kendisi.
- `prompt.md`: Birebir prompt (yazım hataları dahil), model, ayar, süre, yapım bilgisi ve varsa notlar.

## Nasıl açılır

Proje klasörüne gir, `index.html` dosyasına çift tıkla. Tarayıcıda açılır, kurulum gerekmez. Chrome önerilir.

- Roket'te `core.js`, İstanbul'da `js/` klasörü `index.html` ile aynı yerde kalmalı; yoksa proje açılmaz.
- Roket ve Asteroit, 3B çizim kütüphanesini internetten çektiği için internetsiz açılmaz. Yalnızca yazı tipi çekenler internetsiz de açılır, sadece yazılar farklı görünür.

## Neyle yapıldı

Hepsi tarayıcının kendi dilleriyle yazıldı: iskelet için HTML, görünüş için CSS, hareket ve hesap için JavaScript. Simülasyon olduğu için hepsinde JavaScript var; çoğunda bu kod `index.html` dosyasının içinde, İstanbul'da ayrı dosyalara bölünmüş.

"Yapım" sütunu, modelin dışarıdan hazır bir şey alıp almadığını gösteriyor:

- **Tamamen kendi kodu:** Dışarıdan hiçbir şey çekilmiyor, her şeyi model yazdı.
- **Kendi kodu + yazı tipi:** Bütün kod modelin, yalnızca yazı tipi Google Fonts'tan geliyor.
- **Three.js kütüphanesi:** 3B çizim için hazır bir kütüphane internetten çekiliyor; çizimin zor kısmı hazır alınmış.

## Claude

Hepsi Claude Code'da, Claude Opus 5.5 modeliyle ve high ayarıyla yapıldı.

| Proje | Ne yapıyor | Süre | Yapım | Dosyalar |
|---|---|---|---|---|
| [Mohaç Savaşı](<Claude/Mohaç Savaşı/>) | 1526 Mohaç Savaşı'nın 3B simülasyonu, müziğiyle | 47 dk 51 sn + 3 dk müzik | Tamamen kendi kodu | Tek HTML |
| [Roket](<Claude/Roket/>) | Dünya'dan kalkıp Ay'a inen roket | 37 dk 48 sn | Three.js + yazı tipi | HTML + 1 JS |
| [İstanbul](<Claude/İstanbul/>) | Bir turistin yapabileceği her şeyi yapabildiğin 3B İstanbul | 29 dk | Tamamen kendi kodu | HTML + 9 JS |
| [Buzul](<Claude/Buzul/>) | Eriyen buzullar ve değişen dünya | 26 dk 30 sn | Kendi kodu + yazı tipi | Tek HTML |
| [Dünya Çekirdeği](<Claude/Dünya Çekirdeği/>) | Dünya'nın iç yapısı: sismik dalgalar ve manyetik alan | 18 dk 6 sn | Kendi kodu + yazı tipi | Tek HTML |
| [Asteroit](<Claude/Asteroit/>) | Uzaydan Dünya'ya çarpan asteroit | 16 dk 8 sn | Three.js + yazı tipi | Tek HTML |
| [Ekran Kartı 5090](<Claude/Ekran Kartı 5090/>) | Parça parça sökülebilen RTX 5090 ekran kartı | 13 dk 31 sn | Kendi kodu + yazı tipi | Tek HTML |

- Asteroit promptunda "Kütüphane kullanma" dendiği hâlde model Three.js kullandı.
- Roket, Buzul ve Dünya Çekirdeği'nde model işe Claude Code'un sayfa tasarım rehberini alarak başladı.

## Codex

| Proje | Ne yapıyor | Model | Süre | Yapım | Dosyalar |
|---|---|---|---|---|---|
| [Kumaş](<Codex/Kumaş/>) | Detaylı kumaş fiziği | GPT-6 Luna Max | 18 dk | Tamamen kendi kodu | Tek HTML |
