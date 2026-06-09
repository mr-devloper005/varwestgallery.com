import Link from 'next/link'
import { ArrowRight, Image as ImageIcon, Search, Sparkles } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

function safeTitle(post?: SitePost | null) {
  return post?.title || 'Untitled feature'
}

function SafeImage({ post, className }: { post?: SitePost | null; className?: string }) {
  return <img src={getEditablePostImage(post)} alt={safeTitle(post)} className={className} />
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string
  title: string
  description: string
  href?: string
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className={`${dc.type.eyebrow} text-[#ffc570]`}>{eyebrow}</p>
        <h2 className={`${dc.type.sectionTitle} mt-3 max-w-4xl`}>{title}</h2>
        <p className={`mt-3 max-w-3xl text-sm leading-7 ${pal.softMutedText}`}>{description}</p>
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-bold text-white/78 transition hover:text-white">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}

function FeaturedHeroCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group relative block min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
      <SafeImage post={post} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.84))]" />
      <div className="relative flex min-h-[420px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/20 bg-black/35 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/82">
            {getEditableCategory(post)}
          </span>
          <span className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/82">
            Library pick
          </span>
        </div>
        <div className="max-w-3xl">
          <h2 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
            {safeTitle(post)}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
            {getEditableExcerpt(post, 180) || 'Discover polished visuals, sharp profiles, and editorial submissions arranged for easy browsing.'}
          </p>
        </div>
      </div>
    </Link>
  )
}

function CompactVisualCard({ post, href, label }: { post: SitePost; href: string; label: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#12100f] shadow-[0_16px_60px_rgba(0,0,0,0.3)]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <SafeImage post={post} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
        <span className="absolute left-4 top-4 rounded-full border border-white/16 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/78">
          {label}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-3 text-xl font-black leading-tight tracking-[-0.04em] text-white">{safeTitle(post)}</h3>
        </div>
      </div>
    </Link>
  )
}

function HorizontalShowcaseCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group grid overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#120e0c] transition duration-300 hover:-translate-y-1 sm:grid-cols-[260px_minmax(0,1fr)]">
      <div className="relative min-h-[210px] overflow-hidden">
        <SafeImage post={post} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffc570]">Collection {String(index + 1).padStart(2, '0')}</p>
        <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{safeTitle(post)}</h3>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/66">{getEditableExcerpt(post, 150) || 'A clear, visual-first card with room for context and a cleaner browse path.'}</p>
      </div>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.4rem] border border-white/10 bg-white/4 p-4 transition duration-300 hover:bg-white/8">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-xs font-black text-[#efd2b0]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffc570]">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight tracking-[-0.04em] text-white">{safeTitle(post)}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/58">{getEditableExcerpt(post, 110) || 'General supporting copy for image-led discovery.'}</p>
      </div>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#120d0b]">
      <div className="aspect-[16/11] overflow-hidden">
        <SafeImage post={post} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.04em] text-white">{safeTitle(post)}</h3>
        <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">{getEditableCategory(post)}</p>
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const hero = posts[0]
  const sideA = posts[1] || hero
  const sideB = posts[2] || posts[1] || hero
  const sideC = posts[3] || posts[2] || hero
  const sideD = posts[4] || posts[3] || hero
  const title = pagesContent.home.hero.title.join(' ') || `Browse ${taskLabel(primaryTask).toLowerCase()}`

  return (
    <section className="relative overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,197,112,0.18),transparent_28%),linear-gradient(180deg,#112851_0%,#0f2144_58%,#090706_100%)]">
      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-center sm:p-5">
          <p className="text-sm font-medium text-white/86">
            Premium browsing for image uploaders, editorial features, and polished public collections.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl text-center">
          <p className={`${dc.type.eyebrow} text-[#ffc570]`}>{pagesContent.home.hero.badge}</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.04] tracking-[-0.06em] text-white sm:text-6xl lg:text-[4.65rem]">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
            {pagesContent.home.hero.description}
          </p>
        </div>

        <form action="/search" className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-3 rounded-[1.35rem] border border-white/12 bg-black/55 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/6 px-4 py-3 text-sm font-bold text-white/78 sm:min-w-[180px]">
            <ImageIcon className="h-4 w-4" /> All
          </div>
          <input
            name="q"
            placeholder={pagesContent.home.hero.searchPlaceholder || 'Search images, stories, and collections'}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-white outline-none placeholder:text-white/44 sm:text-base"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white px-6 py-3 text-sm font-black text-[#0f0d0c] transition hover:opacity-92">
            <Search className="h-4 w-4" /> Search
          </button>
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-white/72">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2"><Sparkles className="h-4 w-4 text-[#ffc570]" /> Curated visual sets</span>
          <span className="rounded-full px-4 py-2">Editorial selections</span>
          <span className="rounded-full px-4 py-2">Image-first discovery</span>
          <span className="rounded-full px-4 py-2">Upload-ready inspiration</span>
        </div>

        <div className="mt-14 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          {hero ? <FeaturedHeroCard post={hero} href={postHref(primaryTask, hero, primaryRoute)} /> : null}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            {sideA ? <CompactVisualCard post={sideA} href={postHref(primaryTask, sideA, primaryRoute)} label="Featured" /> : null}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
              {sideB ? <CompactVisualCard post={sideB} href={postHref(primaryTask, sideB, primaryRoute)} label="New" /> : null}
              {sideC ? <CompactVisualCard post={sideC} href={postHref(primaryTask, sideC, primaryRoute)} label="Curated" /> : null}
            </div>
            {sideD ? <CompactVisualCard post={sideD} href={postHref(primaryTask, sideD, primaryRoute)} label="Studio pick" /> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const railPosts = (timeSections.flatMap((section) => section.posts).length ? timeSections.flatMap((section) => section.posts) : posts).slice(0, 5)
  if (!railPosts.length) return null

  return (
    <section className="bg-[#090706]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Curated collections"
          title="Collections that feel hand-picked for image uploaders and visual storytellers."
          description="Browse larger showcase cards first, then move through compact selections without losing the editorial feel."
          href={primaryRoute}
        />
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_0.95fr_0.7fr_1.4fr_0.45fr]">
          {railPosts.map((post, index) => (
            <div key={post.id || post.slug} className={index === 0 ? 'xl:col-span-1' : ''}>
              <CompactVisualCard post={post} href={postHref(primaryTask, post, primaryRoute)} label={index === 0 ? 'Lead' : `Select ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const featureRows = posts.slice(5, 9)
  const listPosts = posts.slice(9, 15)
  if (!featureRows.length && !listPosts.length) return null

  return (
    <section className="bg-[#0a0807]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <SectionHeader
            eyebrow="Editorial spotlight"
            title="Every asset can become a polished story block."
            description="This section mixes broad visual cards with readable editorial layouts so the page never feels repetitive."
          />
          <div className="mt-8 grid gap-5">
            {featureRows.map((post, index) => (
              <HorizontalShowcaseCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#100c0b] p-6 sm:p-8">
          <p className={`${dc.type.eyebrow} text-[#ffc570]`}>Editors' index</p>
          <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.05em] text-white">
            Fast, clean entries for visitors who already know the mood they want.
          </h3>
          <div className="mt-8 grid gap-4">
            {listPosts.map((post, index) => (
              <EditorialListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections = timeSections.filter((section) => section.posts.length).slice(0, 3)
  const fallback = posts.slice(0, 9)
  const supportPosts = posts.slice(15, 18)

  return (
    <section className="bg-[#090706]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Popular categories and themes"
          title="Topic-led browsing with image-first rhythm."
          description="Each block uses the existing feed, but the presentation changes between wide visual shelves, compact lists, and denser image stacks."
        />

        <div className="mt-8 grid gap-10">
          {sections.length
            ? sections.map((section, sectionIndex) => (
                <div key={section.key} className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
                  <div className="rounded-[2rem] border border-white/10 bg-[#120d0b] p-6 sm:p-8">
                    <p className={`${dc.type.eyebrow} text-[#ffc570]`}>{section.eyebrow}</p>
                    <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.05em] text-white">
                      {sectionIndex === 0 ? 'Curated royalty-free style collections.' : `${section.title} selections with editorial depth.`}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/62">
                      Browse image-led entries, polished post details, and clean supporting summaries without breaking the route structure.
                    </p>
                    <Link href={primaryRoute} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/8">
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {section.posts.slice(0, 3).map((post) => (
                      <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                    ))}
                  </div>
                </div>
              ))
            : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {fallback.map((post) => (
                    <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  ))}
                </div>
              )}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#0f0b09] p-6 sm:p-8">
            <p className={`${dc.type.eyebrow} text-[#ffc570]`}>Browse themes</p>
            <h3 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-0.05em] text-white">
              Find the right image lane faster.
            </h3>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm font-bold text-white/74 sm:grid-cols-3">
              {Array.from(new Set(posts.slice(0, 12).map((post) => getEditableCategory(post)).filter(Boolean))).slice(0, 12).map((item) => (
                <Link key={item} href={primaryRoute} className="rounded-[1rem] border border-white/10 bg-white/4 px-4 py-3 transition hover:bg-white/8">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {supportPosts.map((post, index) => (
              <HorizontalShowcaseCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="border-t border-white/8 bg-[linear-gradient(180deg,#0f2144_0%,#112851_100%)]">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,197,112,0.22),rgba(26,50,99,0.92))] p-8 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className={`${dc.type.eyebrow} text-[#ffc570]`}>Creative upload flow</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.06em] text-white sm:text-5xl">
              Build a polished submission without losing the gallery mood.
            </h2>
          </div>
          <div className="flex flex-col justify-center">
            <p className="max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Explore visual posts, detailed pages, clean category lanes, and public-facing content blocks designed to feel premium on desktop and mobile.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/image" className={dc.button.primary}>Browse visuals</Link>
              <Link href="/contact" className={dc.button.secondary}>Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
