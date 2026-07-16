# 🎵 Chord Map (Next.js Edition)

Migrasi dari project vanilla HTML/CSS/JS **chord-generator** ke **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**, dengan redesign visual berbasis motif **Circle of Fifths**.

Chord Map memperlakukan tiap chord sebagai *node* dan tiap perpindahan sebagai *edge* berbobot (berbasis Circle of Fifths), lewat empat alat:

- **🎲 Generator** — generate progression otomatis (Random Walk / Weighted / Classic Pattern)
- **🔨 Builder** — bangun progression selangkah demi selangkah dengan saran chord kontekstual
- **🗺️ Explorer** — visualisasi graf akor (Canvas) untuk 8 genre musik
- **📚 Referensi** — teori chord function, cadence, roman numerals, & progression populer
- **🎹 Player** *(bonus)* — mainkan chord/progression custom secara interaktif (dulunya UI mati di versi asli, sekarang berfungsi penuh)

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # jalankan hasil build
npm run lint    # ESLint
```

## Struktur Project

```
app/
  page.tsx            Beranda (hero, fitur, genre showcase)
  generator/page.tsx   Generator
  builder/page.tsx     Interactive Builder
  explorer/page.tsx     Explorer (graf canvas)
  reference/page.tsx   Referensi & teori
  player/page.tsx      Chord Player (bonus)
  layout.tsx / globals.css   Layout & design tokens (Tailwind v4 @theme)

components/            Komponen UI reusable (Navbar, GenreButtons, ProgressionChain,
                        ChordGraphCanvas, dst.)

hooks/
  use-audio-engine.ts  Hook React yang membungkus AudioEngine (Web Audio API)

lib/
  chord-data.ts         Data graf akor 8 genre + tipe TypeScript (port dari js/chordData.js)
  music-theory.ts        Fungsi teori musik murni (translateProgressionToKey, dst.)
  progression-generator.ts  Random walk / weighted walk / classic pattern
  builder-logic.ts       Logika saran chord untuk halaman Builder
  audio-engine.ts        Class AudioEngine (Web Audio API), port dari js/audioEngine.js
```

## Catatan Migrasi

- Seluruh **data & logika teori musik** (graf circle-of-fifths per genre, progression populer,
  formula chord, audio engine) dipindahkan 1:1 dari `js/*.js` asli ke modul TypeScript murni di
  `lib/`, dengan tipe eksplisit, tanpa mengubah bobot/nilai aslinya.
- **Visual di-redesign total** memakai Tailwind CSS v4 (bukan menyalin `styles.css` lama). Identitas
  visual baru dibangun dari motif Circle of Fifths itu sendiri (lihat `components/circle-of-fifths-ring.tsx`),
  bukan tema generik.
- Setiap halaman vanilla (`index.html`, `page/*.html`) menjadi route Next.js App Router, dan
  class `ChordProgressionApp` / `InteractiveChordBuilder` (yang tadinya mengatur DOM secara manual)
  dipecah menjadi state + hook React per halaman.
- Fitur "Gunakan di Generator" di halaman Builder (yang di versi asli tidak pernah benar-benar
  berfungsi karena Builder & Generator adalah dua halaman HTML terpisah) sekarang benar-benar
  berfungsi lewat transfer progression via `sessionStorage` + client-side navigation.
- Halaman **Player** (`page/player.html`) di versi asli punya kontrol volume/tempo/custom-input yang
  tidak pernah tersambung ke JavaScript apa pun. Di versi Next.js ini semuanya diimplementasikan
  penuh (volume & tempo memengaruhi `AudioEngine`, custom progression benar-benar bisa di-parse & diputar).

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [@fontsource](https://fontsource.org) (Space Grotesk, Inter, JetBrains Mono — self-hosted, tanpa panggilan ke Google Fonts saat build)
- Web Audio API (native, tanpa library eksternal)
