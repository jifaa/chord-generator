import Link from 'next/link';
import { CircleOfFifthsRing } from '@/components/circle-of-fifths-ring';
import { GENRES } from '@/lib/chord-data';
import Shuffle from '@/components/ui/Shuffle';
import { GenerativeArtScene } from '@/components/ui/anomalous-matter-hero';
import Lightfall from '@/components/ui/Lightfall';
import SpecularButton from '@/components/ui/SpecularButton';
import { Dices, Hammer, Map, BookOpen, Sparkles, Rocket, Music2, Target, Database, GraduationCap } from 'lucide-react';

const FEATURES = [
  {
    href: '/generator',
    Icon: Dices,
    node: 'I → V → vi → IV',
    title: 'Chord Generator',
    description:
      'Generate chord progression secara otomatis dengan tiga mode: Random Walk, Weighted, atau Classic Pattern.',
  },
  {
    href: '/builder',
    Icon: Hammer,
    node: 'pilih → saran → ulangi',
    title: 'Interactive Builder',
    description: 'Bangun progression langkah demi langkah dengan saran chord yang menyesuaikan genre pilihanmu.',
  },
  {
    href: '/explorer',
    Icon: Map,
    node: 'node & edge',
    title: 'Chord Explorer',
    description: 'Visualisasi graf akor untuk 8 genre musik — lihat bobot & arah perpindahan tiap chord.',
  },
  {
    href: '/reference',
    Icon: BookOpen,
    node: 'teori & progresi',
    title: 'Referensi & Teori',
    description: 'Pelajari fungsi chord, cadence, dan progression populer yang dipakai ratusan lagu hit.',
  },
];

const STEPS = [
  { title: 'Pilih Genre', description: 'Mulai dengan genre musik favoritmu — dari Pop sampai Classical.' },
  { title: 'Eksplorasi Graf', description: 'Lihat peta chord dan bobot hubungan antar akor di genre itu.' },
  { title: 'Generate atau Build', description: 'Pakai Generator untuk hasil instan, atau Builder untuk kontrol penuh.' },
  { title: 'Dengarkan & Simpan', description: 'Play progression hasil kreasimu, lalu salin untuk proyek musikmu.' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero - Full width, extends to top */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center -mt-20 pt-20">
        {/* Lightfall Background - furthest back */}
        <div className="absolute inset-0 -z-20">
          <Lightfall
            colors={['#7c5cfc', '#22d3ee', '#a78bfa']}
            backgroundColor="#0a0912"
            speed={0.3}
            streakCount={6}
            streakWidth={1.2}
            streakLength={1.8}
            glow={1.2}
            density={0.5}
            twinkle={0.8}
            zoom={2.5}
            backgroundGlow={0.3}
            opacity={0.8}
            mouseInteraction={true}
            mouseStrength={0.6}
            mouseRadius={0.8}
          />
        </div>

        {/* GenerativeArtScene - middle layer */}
        <div className="absolute inset-0 -z-10">
          <GenerativeArtScene />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-ink/50 z-[1]" />

        {/* Content */}
        <div className="relative z-10 w-full text-center px-8 max-w-5xl mx-auto space-y-12">
          <p className="font-mono inline-flex items-center gap-3 rounded-full border border-violet-soft/30 bg-ink/50 backdrop-blur-sm px-6 py-2.5 text-base uppercase tracking-[0.3em] text-violet-soft">
            graph theory × music theory
          </p>
          <div className="shuffle-title-wrapper space-y-4">
            <Shuffle
              text="Peta perkembangan"
              tag="h1"
              className="block font-hero"
              style={{ textAlign: 'center', fontSize: 'clamp(2.25rem, 7vw, 4rem)', lineHeight: 1.1 }}
              shuffleDirection="down"
              duration={0.5}
              animationMode="evenodd"
              stagger={0.02}
              triggerOnHover={true}
              triggerOnce={true}
              respectReducedMotion={true}
            />
            <Shuffle
              text="akor musikmu"
              tag="span"
              className="block font-hero"
              style={{ textAlign: 'center', color: '#22d3ee', fontSize: 'clamp(2.25rem, 7vw, 4rem)', lineHeight: 1.1 }}
              shuffleDirection="down"
              duration={0.5}
              animationMode="evenodd"
              stagger={0.02}
              triggerOnHover={true}
              triggerOnce={true}
              respectReducedMotion={true}
            />
          </div>
          <p className="max-w-2xl mx-auto text-lg text-ink-200 leading-relaxed">
            Chord Map memperlakukan setiap chord sebagai node dan setiap perpindahan sebagai edge berbobot —
            dipetakan dari Circle of Fifths — supaya kamu bisa menjelajah, men-generate, dan membangun progression
            yang benar-benar terdengar musikal.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/generator" className="contents">
              <SpecularButton
                size="lg"
                radius={9999}
                textColor="#ffffff"
                lineColor="#ffffff"
                baseColor="#7c5cfc"
                intensity={1.5}
                shineSize={8}
                shineFade={35}
                thickness={1.5}
                speed={0.5}
                followMouse
                proximity={200}
                autoAnimate={false}
              >
                <span className="inline-flex items-center gap-2">
                  <Dices size={20} className="shrink-0" aria-hidden="true" />
                  Generate Progression
                </span>
              </SpecularButton>
            </Link>
            <Link href="/explorer" className="contents">
              <SpecularButton
                size="lg"
                radius={9999}
                textColor="#f4f2fb"
                tint="#0a0912"
                tintOpacity={0.85}
                lineColor="#22d3ee"
                baseColor="#2a2440"
                intensity={1.2}
                shineSize={8}
                shineFade={35}
                thickness={1.5}
                speed={0.5}
                followMouse
                proximity={200}
                autoAnimate={false}
              >
                <span className="inline-flex items-center gap-2">
                  <Map size={20} className="shrink-0" aria-hidden="true" />
                  Jelajahi Graf
                </span>
              </SpecularButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Container */}
      <div className="mx-auto max-w-6xl px-5 pb-24">
        {/* Features */}
        <section className="mt-20">
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-ink-100">
            <Sparkles size={22} className="text-amber shrink-0" aria-hidden="true" />
            Fitur Utama
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group rounded-2xl border border-surface-line bg-surface/60 p-6 transition-all hover:-translate-y-1 hover:border-violet-soft/50 hover:bg-surface-hi"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet/10">
                    <f.Icon size={24} className="text-violet-soft" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-500">{f.node}</span>
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold text-ink-100">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-300">{f.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-soft opacity-0 transition-opacity group-hover:opacity-100">
                  Buka <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick start */}
        <section className="mt-20">
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-ink-100">
            <Rocket size={22} className="text-cyan shrink-0" aria-hidden="true" />
            Mulai Sekarang
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-surface-line bg-surface/40 p-5">
                <span className="font-mono text-sm text-cyan">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display mt-2 font-semibold text-ink-100">{step.title}</h3>
                <p className="mt-1.5 text-sm text-ink-300">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Genre showcase */}
        <section className="mt-20">
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-ink-100">
            <Music2 size={22} className="text-violet-soft shrink-0" aria-hidden="true" />
            Genre yang Tersedia
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GENRES.map((genre) => (
              <Link
                key={genre.key}
                href={`/explorer?genre=${genre.key}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-surface-line bg-surface/60 py-6 transition-all hover:-translate-y-1 hover:border-cyan/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10">
                  <Music2 size={20} className="text-cyan" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-ink-200">{genre.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mt-20">
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold text-ink-100">
            <BookOpen size={22} className="text-violet-soft shrink-0" aria-hidden="true" />
            Tentang Website Ini
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-surface-line bg-surface/40 p-6">
              <h3 className="font-display flex items-center gap-2 font-semibold text-ink-100">
                <Target size={16} className="text-amber shrink-0" aria-hidden="true" />
                Tujuan
              </h3>
              <p className="mt-2 text-sm text-ink-300">
                Membantu musisi, composer, dan penggemar musik memahami serta menciptakan chord progression yang
                harmonis lewat visualisasi graf yang intuitif.
              </p>
            </div>
            <div className="rounded-2xl border border-surface-line bg-surface/40 p-6">
              <h3 className="font-display flex items-center gap-2 font-semibold text-ink-100">
                <Database size={16} className="text-cyan shrink-0" aria-hidden="true" />
                Berbasis Data
              </h3>
              <p className="mt-2 text-sm text-ink-300">
                Setiap graf dibangun dari analisis lagu populer. Bobot tiap edge menunjukkan seberapa sering
                perpindahan chord itu dipakai dalam musik nyata.
              </p>
            </div>
            <div className="rounded-2xl border border-surface-line bg-surface/40 p-6">
              <h3 className="font-display flex items-center gap-2 font-semibold text-ink-100">
                <GraduationCap size={16} className="text-mint shrink-0" aria-hidden="true" />
                Edukatif
              </h3>
              <p className="mt-2 text-sm text-ink-300">
                Selain untuk kreasi, aplikasi ini jadi media belajar teori musik: fungsi chord, cadence, dan
                representasi harmoni sebagai graf.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
