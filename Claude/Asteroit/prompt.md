# Asteroit

Uzaydan Dünya'ya çarpan asteroit.

| | |
|---|---|
| Model | Claude Opus 5.5 |
| Ayar | high |
| Araç | Claude Code |
| Süre | 16 dk 8 sn |
| Yapım | Three.js kütüphanesi + yazı tipi |
| Dosyalar | Tek HTML |

## Prompt

```
Uzay boşluğundan dünyaya çarpan bir astroid simüle edelim. 3D olsun, tasarım, hayal gücü sana ait. Kütüphane kullanma. Html çıktı ver.
```

## Notlar

- Promptta "Kütüphane kullanma" deniyor; model yine de 3B çizim için Three.js kütüphanesini internetten çekti. Modelin hatası.
- Dosyada karakter kodlaması satırı yoktu; Türkçe harfler bazı tarayıcılarda bozuk görünmesin diye en başa `<meta charset="utf-8">` eklendi. Kodun geri kalanı modelin çıktısı.
