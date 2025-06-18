# 💰 Bérkalkulator - Professzionális Fizetésszámító

> **Professzionális bérkalkulátor a 2025-ös magyar adószabályok szerint**  
> Számítsa ki nettó bérét, adóit és járulékait másodpercek alatt. Részletes elemzések, grafikonok és pénzügyi betekintés.

## 🎯 Főbb funkciók

### 💼 Bérkalkulátor
- **Valós idejű számítás** - Azonnali eredmények a 2025-ös magyar adórendszer szerint
- **Részletes lebontás** - SZJA, TB járulék, munkanélküli járulék külön megjelenítése
- **Családi kedvezmények** - Gyermekek száma alapján automatikus számítás
- **25 év alatti mentesség** - SZJA mentesség figyelembevétele
- **Interaktív grafikonok** - Vizuális megjelenítés Chart.js-szel
- **Typewriter animáció** - Élménydús felhasználói élmény

### 🎰 Blackjack Játék
- **Virtuális kaszinó** - Játssza el a számított nettó bérét
- **Valódi blackjack szabályok** - Professzionális kártyajáték élmény
- **Reszponzív design** - Desktop és mobil eszközökön egyaránt

### 🎨 Design és UX
- **New York Times ihletésű stílus** - Elegáns, professzionális megjelenés
- **Teljesen reszponzív** - Minden eszközön tökéletes megjelenés
- **Accessibility** - Akadálymentesített használat
- **Modern animációk** - Smooth interakciók és átmenetek

## 🚀 Gyors kezdés

### Online használat
Kattintson ide a közvetlen használathoz: **[Bérkalkulator](https://vnorman1.github.io/beercalc/)**

### Helyi futtatás

```bash
# Repository klónozása
git clone https://github.com/vnorman1/beercalc.git

# Könyvtár megnyitása
cd beercalc

# Egyszerű HTTP szerver indítása (Python 3)
python -m http.server 8000

# Vagy Node.js-szel
npx serve .
```

Ezután nyissa meg a böngészőben: `http://localhost:8000`

## 📊 Használat

### 1. Bérkalkulátor használata

1. **Adatok megadása:**
   - Bruttó havi fizetés megadása forintban
   - Gyermekek számának kiválasztása (0-4+)
   - Családi állapot beállítása
   - 25 év alatti státusz jelölése

2. **Számítás indítása:**
   - Kattintson a "Számítás indítása" gombra
   - Nézze végig a typewriter animációt
   - Tanulmányozza a részletes eredményeket

3. **Eredmények értelmezése:**
   - **Bruttó fizetés** - A megadott összeg
   - **Levonások** - Összes adó és járulék
   - **Nettó fizetés** - A kézhez kapott összeg
   - **Grafikon** - Vizuális lebontás

### 2. Blackjack játék

1. Navigáljon a `/blackjack/` oldalra
2. Használja a bérkalkulátor eredményét tétként
3. Játsszon a klasszikus blackjack szabályok szerint
4. Próbálja meg megduplázni a nettó bérét!

## 🔧 Technikai specifikáció

### Frontend
- **HTML5** - Szemantikus markup
- **CSS3** - TailwindCSS framework
- **JavaScript (ES6+)** - Modern JS funkciók
- **Chart.js** - Interaktív grafikonok
- **Google Fonts** - Playfair Display & Inter

### Adatok
- **JSON konfiguráció** - 2025-ös magyar adórendszer
- **Valós idejű számítás** - Client-side feldolgozás
- **LocalStorage** - Számítási előzmények tárolása

### SEO és teljesítmény
- **Meta tags** - Teljes SEO optimalizálás
- **Open Graph** - Közösségi média integráció
- **JSON-LD** - Strukturált adatok
- **Sitemap.xml** - Keresőmotor indexelés
- **Robots.txt** - Crawler irányítás

## 📱 Kompatibilitás

| Böngésző | Minimum verzió | Tesztelve |
|----------|----------------|-----------|
| Chrome   | 60+            | ✅        |
| Firefox  | 55+            | ✅        |
| Safari   | 12+            | ✅        |
| Edge     | 79+            | ✅        |

| Eszköz   | Támogatás      | Optimalizálva |
|----------|----------------|---------------|
| Desktop  | ✅             | ✅            |
| Tablet   | ✅             | ✅            |
| Mobile   | ✅             | ✅            |

## 📈 2025-ös adórendszer

Az alkalmazás a következő 2025-ös magyar adószabályokat használja:

### Adókulcsok
- **SZJA**: 15% (25 év felett)
- **TB járulék**: 18.5%
- **Munkanélküli járulék**: 1.5%
- **Nyugdíjjárulék**: 10%

### Családi kedvezmények
- **1 gyermek**: 10,000 Ft/hó
- **2 gyermek**: 20,000 Ft/hó  
- **3+ gyermek**: 33,000 Ft/hó

### Különleges szabályok
- **25 év alatti SZJA mentesség**: Teljes SZJA mentesség
- **Minimálbér**: 266,800 Ft
- **Átlagbér**: 573,300 Ft

## 🏗️ Projekt struktúra

```
athernous/
├── index.html              # Főoldal - Bérkalkulátor
├── script.js               # Fő JavaScript logika
├── style.css               # Egyéni stílusok
├── blackjack/
│   ├── blackjack.html      # Blackjack játék
│   └── black.js            # Játék logika
├── data/
│   ├── 2025.json           # Adókulcsok és szabályok
│   ├── favicon.png         # Favicon
│   └── og.png              # Social media kép
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Crawler szabályok
└── readme.md               # Ez a dokumentáció
```

## 🎨 Customizálás

### Színek testreszabása
A TailwindCSS osztályok módosításával könnyedén testreszabhatja a színsémát:

```css
/* Fő színek */
.bg-gray-900    /* Sötét háttér */
.text-gray-900  /* Sötét szöveg */
.border-gray-900 /* Sötét keret */
```

### Animációk módosítása
A typewriter effekt sebességének változtatása:

```javascript
// script.js - typeWriter függvény
function typeWriter(element, text, speed = 50) {
    // speed értékének csökkentése = gyorsabb animáció
}
```

