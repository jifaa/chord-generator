import { PageHeader } from '@/components/page-header';
import { Panel } from '@/components/panel';
import { PopularProgressionCards } from '@/components/popular-progression-cards';
import { BookOpen, Network, FunctionSquare, Hash, TrendingUp, ArrowRightLeft } from 'lucide-react';

const GRAPH_THEORY_CARDS = [
  {
    title: 'Graf Berarah (Directed Graph)',
    body: (
      <>
        Dalam musik, urutan akor sangat penting. Gerakan dari <strong className="text-ink-100">G7 → C</strong>{' '}
        (Dominant ke Tonic) memiliki tarikan gravitasi yang kuat, seperti &ldquo;pulang ke rumah&rdquo;.
      </>
    ),
  },
  {
    title: 'Graf Berbobot (Weighted Graph)',
    body: (
      <>
        Tidak semua perpindahan memiliki peluang sama. Dari akor <strong className="text-ink-100">C</strong>: ke G
        (V) 40% — sangat umum, ke Am (vi) 30% — emosional, ke F (IV) 20% — standar, ke Dm (ii) 10% — jazzy.
      </>
    ),
  },
  {
    title: 'Adjacency List',
    body: 'Graf akor direpresentasikan sebagai daftar ketetanggaan, di mana setiap node (akor) memiliki daftar node tujuan yang valid.',
  },
];

const CHORD_FUNCTIONS = [
  {
    title: 'Tonic (I)',
    accent: 'border-mint/40 bg-mint/5',
    body: 'Chord "rumah" yang memberikan rasa stabil dan selesai. Progression biasanya dimulai dan diakhiri dengan tonic. Contoh: C dalam kunci C Mayor.',
  },
  {
    title: 'Subdominant (IV)',
    accent: 'border-cyan/40 bg-cyan/5',
    body: 'Chord yang memberikan gerakan menjauhi tonic. Sering dipakai untuk transisi dan membangun tensi ringan. Contoh: F dalam kunci C Mayor.',
  },
  {
    title: 'Dominant (V)',
    accent: 'border-rose/40 bg-rose/5',
    body: 'Chord dengan tensi tertinggi yang "menarik" kembali ke tonic. V→I adalah resolusi paling kuat dalam musik. Contoh: G dalam kunci C Mayor.',
  },
];

const ROMAN_NUMERALS = [
  { numeral: 'I', fn: 'Tonic', quality: 'Mayor', example: 'C' },
  { numeral: 'ii', fn: 'Supertonic', quality: 'Minor', example: 'Dm' },
  { numeral: 'iii', fn: 'Mediant', quality: 'Minor', example: 'Em' },
  { numeral: 'IV', fn: 'Subdominant', quality: 'Mayor', example: 'F' },
  { numeral: 'V', fn: 'Dominant', quality: 'Mayor', example: 'G' },
  { numeral: 'vi', fn: 'Submediant', quality: 'Minor', example: 'Am' },
  { numeral: 'vii°', fn: 'Leading Tone', quality: 'Diminished', example: 'Bdim' },
];

const CADENCES = [
  { title: 'Authentic Cadence (V-I)', example: 'G → C', body: 'Cadence paling kuat dan conclusive. Memberikan rasa "selesai" yang sempurna. Sangat umum di akhir lagu atau section.' },
  { title: 'Plagal Cadence (IV-I)', example: 'F → C', body: 'Disebut juga "Amen Cadence" karena sering dipakai di musik gereja. Lebih lembut dari authentic cadence.' },
  { title: 'Deceptive Cadence (V-vi)', example: 'G → Am', body: 'Mengejutkan pendengar dengan tidak kembali ke tonic. Dipakai untuk memperpanjang progression atau memberi twist.' },
];

export default function ReferencePage() {
  return (
    <div className="w-full pb-24">
      <PageHeader
        eyebrow="teori & progresi"
        title="Referensi & Teori"
        description="Pelajari chord progression populer dan teori musik dasar di balik Chord Map."
        icon={BookOpen}
      />

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="font-display flex items-center gap-2 mb-5 text-xl font-semibold text-ink-100">
            <TrendingUp size={20} className="text-cyan shrink-0" aria-hidden="true" />
            Progression Populer
          </h2>
          <PopularProgressionCards />
        </section>

        <section>
          <h2 className="font-display flex items-center gap-2 mb-5 text-xl font-semibold text-ink-100">
            <Network size={20} className="text-violet-soft shrink-0" aria-hidden="true" />
            Teori Graf dalam Musik
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {GRAPH_THEORY_CARDS.map((card) => (
              <div key={card.title} className="rounded-2xl border border-surface-line bg-surface-hi p-4">
                <h3 className="font-display font-semibold text-ink-100">{card.title}</h3>
                <p className="mt-2 text-sm text-ink-300">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display flex items-center gap-2 mb-5 text-xl font-semibold text-ink-100">
            <FunctionSquare size={20} className="text-mint shrink-0" aria-hidden="true" />
            Fungsi Akor
          </h2>
          {/* 2-col layout for functions — more horizontal space per card */}
          <div className="grid gap-4 sm:grid-cols-2">
            {CHORD_FUNCTIONS.map((card) => (
              <div key={card.title} className={`rounded-2xl border p-5 ${card.accent}`}>
                <h3 className="font-display font-semibold text-ink-100">{card.title}</h3>
                <p className="mt-2 text-sm text-ink-300">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display flex items-center gap-2 mb-5 text-xl font-semibold text-ink-100">
            <Hash size={20} className="text-violet-soft shrink-0" aria-hidden="true" />
            Roman Numerals dalam Musik
          </h2>
          {/* Tinted bg bridges the visual gap between card sections and the table */}
          <div className="overflow-x-auto rounded-2xl border border-surface-line bg-surface-hi/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Numeral</th>
                  <th className="px-4 py-3 font-medium">Fungsi</th>
                  <th className="px-4 py-3 font-medium">Kualitas</th>
                  <th className="px-4 py-3 font-medium">Contoh (C Mayor)</th>
                </tr>
              </thead>
              <tbody>
                {ROMAN_NUMERALS.map((row) => (
                  <tr key={row.numeral} className="border-t border-surface-line">
                    <td className="font-mono px-4 py-3 font-semibold text-violet-soft">{row.numeral}</td>
                    <td className="px-4 py-3 text-ink-200">{row.fn}</td>
                    <td className="px-4 py-3 text-ink-300">{row.quality}</td>
                    <td className="font-mono px-4 py-3 text-ink-100">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display flex items-center gap-2 mb-5 text-xl font-semibold text-ink-100">
            <ArrowRightLeft size={20} className="text-amber shrink-0" aria-hidden="true" />
            Jenis Cadence
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {CADENCES.map((c) => (
              <Panel key={c.title}>
                <h3 className="font-display font-semibold text-ink-100">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-300">{c.body}</p>
                <p className="font-mono mt-3 text-lg font-semibold text-cyan">{c.example}</p>
              </Panel>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
