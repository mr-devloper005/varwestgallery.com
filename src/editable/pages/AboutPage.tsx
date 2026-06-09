import Link from 'next/link'
import { ArrowRight, Compass, Image as ImageIcon, LayoutGrid, Sparkles } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,197,112,0.16),transparent_24%),linear-gradient(180deg,#0f2144_0%,#112851_42%,#090706_100%)] text-[#efd2b0]">
        <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,197,112,0.14),rgba(17,40,81,0.96))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffc570]">{pagesContent.about.badge}</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.08em] text-white sm:text-7xl">
                About {SITE_CONFIG.name}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-9 text-white/72">{pagesContent.about.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  <Sparkles className="h-4 w-4 text-[#ffc570]" /> Curated presentation
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  <LayoutGrid className="h-4 w-4 text-[#ffc570]" /> Connected sections
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  <ImageIcon className="h-4 w-4 text-[#ffc570]" /> Visual-first rhythm
                </span>
              </div>
            </article>

            <aside className="grid gap-5">
              <div className="rounded-[2rem] border border-white/10 bg-[#f2e4cf] p-6 text-[#1a3263] shadow-[0_24px_90px_rgba(0,0,0,0.16)] sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#547792]">At a glance</p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.05em]">
                  A cleaner, more confident public-facing experience.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#1a3263]/72">
                  The site is designed to keep reading, browsing, and discovery feeling polished across every active section.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <StatCard label="Experience" value="Modern" />
                <StatCard label="Focus" value="Readable" />
                <StatCard label="Style" value="Premium" />
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <article className="rounded-[2.1rem] border border-white/10 bg-[#f4e8d6] p-7 text-black shadow-[0_24px_90px_rgba(0,0,0,0.14)] sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#547792]">Our approach</p>
              <h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.06em]">
                Built to make discovery feel composed instead of cluttered.
              </h2>
              <div className="mt-8 space-y-5 text-base leading-8 text-black/78">
                {pagesContent.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/image" className="inline-flex items-center gap-2 rounded-full bg-[#1a3263] px-6 py-3 text-sm font-black text-[#efd2b0] transition hover:opacity-95">
                  Explore visuals <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-[#1a3263]/12 bg-white/70 px-6 py-3 text-sm font-black text-[#1a3263] transition hover:bg-white">
                  Search archive
                </Link>
              </div>
            </article>

            <div className="grid gap-5">
              {pagesContent.about.values.map((value, index) => (
                <div
                  key={value.title}
                  className={`rounded-[2rem] border shadow-[0_20px_80px_rgba(0,0,0,0.18)] ${
                    index === 1
                      ? 'border-white/10 bg-[#0f2144] p-6 text-[#efd2b0]'
                      : 'border-[#1a3263]/10 bg-white/80 p-6 text-[#1a3263]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        index === 1 ? 'bg-white/8 text-[#ffc570]' : 'bg-[#1a3263]/6 text-[#547792]'
                      }`}
                    >
                      {index === 0 ? <Compass className="h-5 w-5" /> : index === 1 ? <LayoutGrid className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.04em]">{value.title}</h3>
                      <p className={`mt-3 text-sm leading-7 ${index === 1 ? 'text-white/66' : 'text-[#1a3263]/70'}`}>{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 text-center shadow-[0_18px_70px_rgba(0,0,0,0.2)]">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">{value}</p>
    </div>
  )
}
