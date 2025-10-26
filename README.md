Animated Weather — Animasyonlu Hava Durumu (HTML/CSS/JS)

Konuma veya arama ile çalışan, hava durumuna göre dinamik ve animasyonlu arka planlar gösteren, Open-Meteo API ve WebAudio ile yağmur sesi üreten hava durumu uygulaması.

🔎 Özellikler

- Kullanıcının tarayıcı konumunu kullanarak o konumun güncel hava durumunu gösterme.  
- Arama çubuğuna şehir veya konum girerek başka bir yerin hava durumunu sorgulama.
- Open-Meteo API ile `current_weather` ve `daily` (günlük weathercode) verisi kullanımı — **API anahtarı gerektirmez**.  
- Hava kodlarına göre değişken, performansa uygun arka plan animasyonları:
  • Güneşli → güneş ışınları
  • Bulutlu → yüzen bulutlar
  • Yağmur → düşen damlalar
  • Kar → düşen kar tanecikleri
  • Fırtına → şimşek/flash efekti
  • Sis → hafif hareketli sis katmanı
- SVG ikonlar ve ikon animasyonları (hava durumuna uygun).  
- WebAudio ile **kullanıcı başlatmalı** yağmur sesi üretimi (tarayıcı autoplay politikalarına uyumlu).  
- Tema (dark/light), birim (°C/°F), responsive tasarım.

📡 API Bilgisi;
- Hava verileri için: **Open-Meteo** (`https://api.open-meteo.com`) kullanıldı.  
- Coğrafi ad → koordinat dönüşü için: **Open-Meteo Geocoding**.  
- `current_weather` ve `daily=weathercode` parametreleri ile güncel + tahmin verisi alınıyor.  
- Avantaj: ücretsiz, anahtar gerektirmez, CORS dostu.

🔊 Ses (WebAudio) Hakkında;
- Yağmur sesi, **WebAudio API** ile tarayıcıda üretiliyor (white noise + filtreleme + LFO ile atmosferik efekt).
- Ses **kullanıcı tıklamasıyla** başlatılır (autoplay politikaları nedeniyle).  
- İsteğe bağlı olarak gerçek ses dosyasıyla (örn. lisanslı rain-loop) veya ses yoğunluğu slider’ı ile desteklenebilir.

✨ Yararlanılan Teknolojiler;
- Proje geliştirilirken **Open-Meteo** servisinden yararlanılmıştır.  
- Hava kodlarına göre arka plan animasyonları ve WebAudio tabanlı yağmur sesi entegrasyonunda **ChatGPT (GPT-5 Thinking)** tarafından verilen teknik öneriler, örnek kodlar ve optimizasyon taktiklerinden faydalanılmıştır.
