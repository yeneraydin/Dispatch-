# 🚛 Dispatch — Freight Trucking Platform

## Vercel'e Yükleme (Adım Adım)

---

### ADIM 1 — GitHub Hesabı Aç (ücretsiz)
1. https://github.com adresine git
2. "Sign up" → hesap oluştur
3. Email doğrula

---

### ADIM 2 — Bu Projeyi GitHub'a Yükle

**Seçenek A — GitHub Desktop (kolay, görsel)**
1. https://desktop.github.com → indir ve kur
2. "File" → "New Repository"
3. İsim: `dispatch-app`
4. Bu klasörü seç
5. "Publish repository" → GitHub'a yükle

**Seçenek B — Terminal**
```bash
cd dispatch-app
git init
git add .
git commit -m "Initial commit"
gh repo create dispatch-app --public --push
```

---

### ADIM 3 — Vercel Hesabı Aç (ücretsiz)
1. https://vercel.com adresine git
2. "Sign up" → "Continue with GitHub" seç
3. GitHub hesabınla bağlan

---

### ADIM 4 — Deploy Et
1. Vercel dashboard'da **"Add New Project"** tıkla
2. GitHub'daki `dispatch-app` reposunu seç → **"Import"**
3. Ayarlar otomatik gelir (Vite algılar)
4. **"Deploy"** tıkla
5. 1-2 dakika bekle ✅

---

### ADIM 5 — URL'ini Al
Deploy tamamlanınca:
```
https://dispatch-app.vercel.app
```
gibi bir URL alırsın. Bu URL herkese açık, dünya genelinde erişilebilir.

---

### 📱 iPhone'a Uygulama Olarak Eklemek
1. iPhone'da **Safari** ile URL'ini aç
2. Alt ortadaki **paylaş** ikonuna bas (kare + ok)
3. **"Ana Ekrana Ekle"** seç
4. İsim: "Dispatch" → **"Ekle"**
5. Ana ekranda uygulama ikonu çıkar ✅
6. Tam ekran, uygulama gibi açılır

---

### 🔧 Kendi Domain Bağlamak (İsteğe Bağlı)
1. Vercel → Proje → "Settings" → "Domains"
2. "Add Domain" → örn: `dispatchfreight.com`
3. Domain sağlayıcında (GoDaddy, Namecheap) DNS ayarları yap
4. Vercel talimatları gösterir

---

### ⚙️ Admin Paneline Erişmek
URL sonuna ekle:
```
https://dispatch-app.vercel.app/?admin=dispatch2024
```
Şifre: `Dispatch@2024!`

---

### 🔄 Güncelleme Yapmak
Kodda değişiklik yapıp GitHub'a push edince Vercel **otomatik** yeniden deploy eder.

---

## Proje Yapısı
```
dispatch-app/
├── src/
│   ├── App.jsx        ← Ana uygulama kodu
│   └── main.jsx       ← React giriş noktası
├── public/
│   ├── manifest.json  ← PWA ayarları
│   └── icons/         ← Uygulama ikonları
├── index.html         ← HTML şablonu
├── package.json       ← Bağımlılıklar
├── vite.config.js     ← Build ayarları
└── vercel.json        ← Vercel ayarları
```

## Yerel Geliştirme
```bash
npm install
npm run dev
# http://localhost:5173 adresinde açılır
```
