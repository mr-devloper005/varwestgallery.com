import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Bookmark, BriefcaseBusiness, Building2, Camera, Download, FileText, Filter, Image as ImageIcon, MapPin, Megaphone, Search, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const dedupeUrls = (urls: Array<string | null | undefined>): string[] =>
  Array.from(new Set(urls.map((url) => (typeof url === 'string' ? url.trim() : '')).filter((url) => url.length > 0)))

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return dedupeUrls([...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])]).filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body) || 'Open this entry for the full details.'
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskDeck: Record<TaskKey, { icon: typeof FileText; badge: string; promise: string }> = {
  article: { icon: FileText, badge: 'Editorial', promise: 'Long-form posts get a magazine-led listing with strong hierarchy and cleaner image pacing.' },
  listing: { icon: Building2, badge: 'Directory', promise: 'Listings surface location, business identity, and supporting details without losing visual polish.' },
  classified: { icon: Megaphone, badge: 'Offers', promise: 'Offers remain direct and practical, but now live inside a richer visual marketplace.' },
  image: { icon: Camera, badge: 'Visual', promise: 'Image posts lead with larger visuals, masonry rhythm, and compact metadata.' },
  sbm: { icon: Bookmark, badge: 'Saved', promise: 'Saved resources read like curated shelves with fast-scan browsing.' },
  pdf: { icon: Download, badge: 'Library', promise: 'Documents keep the archive feel with clearer file emphasis and useful summaries.' },
  profile: { icon: UserRound, badge: 'Profile', promise: 'Profiles stay supported, but the layout keeps the same luxury editorial shell.' },
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const deck = taskDeck[task]
  const Icon = deck.icon
  const archiveVars = {
    '--archive-bg': '#090706',
    '--archive-text': '#efd2b0',
    '--archive-surface': '#0f2144',
    '--archive-card': '#112851',
    '--archive-accent': '#ffc570',
    '--archive-muted': 'rgba(239,210,176,0.66)',
    '--editable-border': 'rgba(239,210,176,0.10)',
  } as CSSProperties
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  if (task === 'profile') {
    return (
      <EditableSiteShell>
        <main style={archiveVars} className="bg-[var(--archive-bg)] text-[var(--archive-text)]">
          <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.72fr]">
              <div className="rounded-[2.2rem] border border-[var(--editable-border)] bg-[#f2e4cf] p-7 text-[#1a3263] shadow-[0_30px_100px_rgba(0,0,0,0.18)] sm:p-9">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1a3263]/10 bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#547792]">
                  <Icon className="h-4 w-4" /> {deck.badge}
                </div>
                <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.07em] sm:text-6xl">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#1a3263]/72">
                  {voice?.description || SITE_CONFIG.description}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {['Profile cards', 'About blocks', 'Clean directory view'].map((item) => (
                    <div key={item} className="rounded-[1.4rem] border border-[#1a3263]/10 bg-white/60 p-4 text-sm font-bold leading-6 text-[#1a3263]/72">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.2rem] border border-[var(--editable-border)] bg-[linear-gradient(135deg,rgba(255,197,112,0.14),rgba(17,40,81,0.96))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.26)] sm:p-9">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--archive-accent)]">Profile dashboard</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Showing</p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">{posts.length}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">Visible profile entries on this page.</p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Category</p>
                    <p className="mt-3 text-2xl font-black tracking-[-0.05em] text-white">{categoryLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">Filter lane currently applied.</p>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/5 p-5 text-sm font-bold leading-7 text-white/66">
                  {deck.promise}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[var(--archive-surface)] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.22)]">
                <form action={basePath}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white/52">
                    <Filter className="h-4 w-4" /> Filter profiles
                  </div>
                  <select
                    name="category"
                    defaultValue={category}
                    className="mt-4 h-12 w-full rounded-[1.1rem] border border-white/10 bg-black/20 px-4 text-sm font-bold text-white outline-none"
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button className="mt-3 h-12 w-full rounded-[1.1rem] bg-[#ffc570] text-sm font-black text-[#1a3263]">Apply</button>
                  <Link href="/search" className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/5 text-sm font-black text-white transition hover:bg-white/8">
                    Search site
                  </Link>
                </form>
                <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--archive-accent)]">{voice?.secondaryNote || 'Curated browsing'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(voice?.chips || []).map((chip) => (
                      <span key={chip} className="rounded-full border border-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/74">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">
            {posts.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post, index) => (
                  <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/4 p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-white/42" />
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">No profiles found</h2>
                <p className="mt-2 text-sm text-white/58">Try another category or check back after new profiles are published.</p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-white/12 bg-white/4 px-5 py-3 text-sm font-black text-white">
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full bg-[#ffc570] px-5 py-3 text-sm font-black text-[#1a3263]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-white/12 bg-white/4 px-5 py-3 text-sm font-black text-white">
                  Next
                </Link>
              ) : null}
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main style={archiveVars} className="bg-[var(--archive-bg)] text-[var(--archive-text)]">
        <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="rounded-[2.2rem] border border-[var(--editable-border)] bg-[linear-gradient(135deg,rgba(255,197,112,0.14),rgba(17,40,81,0.96))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--archive-accent)]">
                <Icon className="h-4 w-4" /> {deck.badge}
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.07em] sm:text-6xl">
                {voice?.headline || `Browse ${label}`}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--archive-muted)]">
                {voice?.description || SITE_CONFIG.description}
              </p>
              <div className="mt-7 rounded-[1.6rem] border border-white/10 bg-white/4 p-4 text-sm font-bold leading-7 text-white/72">
                {deck.promise}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/search" className="rounded-full border border-white/12 px-5 py-3 text-sm font-black text-white transition hover:bg-white/8">Search</Link>
              </div>
            </div>

            <div className="grid gap-6">
              <form action={basePath} className="rounded-[2rem] border border-[var(--editable-border)] bg-[var(--archive-surface)] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.22)]">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white/52">
                  <Filter className="h-4 w-4" /> Filter archive
                </div>
                <select
                  name="category"
                  defaultValue={category}
                  className="mt-4 h-12 w-full rounded-[1.1rem] border border-white/10 bg-black/20 px-4 text-sm font-bold text-white outline-none"
                >
                  <option value="all">All categories</option>
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button className="mt-3 h-12 w-full rounded-[1.1rem] bg-[#ffc570] text-sm font-black text-[#1a3263]">Apply</button>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/46">Showing {categoryLabel}</p>
              </form>

              <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[#100c0b] p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--archive-accent)]">{voice?.secondaryNote || 'Curated browsing'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(voice?.chips || []).map((chip) => (
                    <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/74">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">
          {posts.length ? (
            <div className={task === 'image' ? 'columns-1 gap-5 space-y-5 md:columns-2 xl:columns-3' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
              {posts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/4 p-10 text-center">
              <Search className="mx-auto h-8 w-8 text-white/42" />
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">No posts found</h2>
              <p className="mt-2 text-sm text-white/58">Try another category or check back after new content is published.</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {pagination.hasPrevPage ? (
              <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-white/12 bg-white/4 px-5 py-3 text-sm font-black text-white">
                Previous
              </Link>
            ) : null}
            <span className="rounded-full bg-[#ffc570] px-5 py-3 text-sm font-black text-[#1a3263]">
              Page {page} of {pagination.totalPages || 1}
            </span>
            {pagination.hasNextPage ? (
              <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-white/12 bg-white/4 px-5 py-3 text-sm font-black text-white">
                Next
              </Link>
            ) : null}
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#120d0b] shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img src={getImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/82">
          {getCategory(post, 'Article')}
        </span>
      </div>
      <div className="p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffc570]">Feature {String(index + 1).padStart(2, '0')}</p>
        <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/62">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  return (
    <Link href={href} className="group grid gap-5 rounded-[1.9rem] border border-white/10 bg-[#120d0b] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1 sm:grid-cols-[120px_1fr]">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.4rem] bg-white/6">
        {logo ? <img src={logo} alt={post.title} className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-10 w-10 text-white/35" />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0d0908]">Directory</span>
          {location ? <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/72"><MapPin className="h-3 w-3" /> {location}</span> : null}
        </div>
        <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/62">{getSummary(post)}</p>
        {phone ? <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#ffc570]">Phone available</p> : null}
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImages(post)[0]
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#120d0b] shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1">
      <div className="grid min-h-[260px] sm:grid-cols-[0.8fr_1fr]">
        <div className="relative bg-[linear-gradient(180deg,rgba(255,197,112,0.2),rgba(26,50,99,0.88))] p-5 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/68">Classified</p>
          <h2 className="mt-6 text-3xl font-black leading-none tracking-[-0.06em]">{price}</h2>
          <p className="mt-3 text-sm font-bold text-white/68">{location || 'Open details inside'}</p>
          {image ? <img src={image} alt={post.title} className="absolute bottom-4 right-4 h-20 w-20 rounded-[1.2rem] object-cover" /> : null}
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h3>
          <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/62">{getSummary(post)}</p>
        </div>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[1.85rem] border border-white/10 bg-[#120d0b] shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1">
      <div className={index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-[5/4]' : 'aspect-[4/3]'}>
        <img src={getImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/74">
          <ImageIcon className="h-3 w-3" /> Visual
        </div>
        <h2 className="mt-4 line-clamp-3 text-xl font-black leading-tight tracking-[-0.04em] text-white">{post.title}</h2>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group block rounded-[1.8rem] border border-white/10 bg-[#120d0b] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/78">Shelf {String(index + 1).padStart(2, '0')}</span>
        <Bookmark className="h-5 w-5 text-[#ffc570]" />
      </div>
      <h2 className="mt-8 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h2>
      <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/62">{getSummary(post)}</p>
      {website ? <p className="mt-5 truncate text-xs font-black uppercase tracking-[0.16em] text-white/42">{website.replace(/^https?:\/\//, '')}</p> : null}
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="rounded-[1.8rem] border border-white/10 bg-[#120d0b] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-[1.4rem] bg-white p-5 text-[#0d0908]"><FileText className="h-8 w-8" /></div>
        <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/74">{getCategory(post, 'PDF')}</span>
      </div>
      <h2 className="mt-8 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h2>
      <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/62">{getSummary(post)}</p>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const summary = getSummary(post)
  return (
    <Link href={href} className="group rounded-[2rem] border border-[#1a3263]/10 bg-[#f4e8d6] p-6 text-[#1a3263] shadow-[0_20px_80px_rgba(0,0,0,0.14)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#1a3263]/10 bg-white">
            {avatar ? <img src={avatar} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-[#547792]" />}
          </div>
          <div>
            <h2 className="text-2xl font-black leading-tight tracking-[-0.05em]">{post.title}</h2>
            {role ? <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-[#547792]">{role}</p> : null}
          </div>
        </div>
        <span className="rounded-full border border-[#1a3263]/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#547792]">
          Profile
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {['0 Posts', '0 Following', '0 Saved'].map((item) => (
          <div key={item} className="rounded-[1.1rem] border border-[#1a3263]/10 bg-white/70 px-3 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#1a3263]/72">
            {item}
          </div>
        ))}
      </div>
      <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#1a3263]/70">{summary}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4d4f] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
          View profile
        </span>
        {website ? <span className="truncate text-xs font-black uppercase tracking-[0.16em] text-[#547792]">{website.replace(/^https?:\/\//, '')}</span> : null}
      </div>
    </Link>
  )
}
