import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search, Sparkles } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { buildPostUrl, getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})

const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? (content.images.find((item) => typeof item === 'string') as string | undefined) : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || '/placeholder.svg?height=900&width=1200'
}

const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''
const categoryOf = (post: SitePost) => compactRaw(getContent(post).category) || post.tags?.[0] || 'Featured'

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const href = task ? buildPostUrl(task, post.slug) : `/article/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const category = categoryOf(post)
  const variant = index % 5

  if (variant === 0) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f2144] shadow-[0_24px_90px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1 md:col-span-2">
        <div className="grid min-h-[320px] md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[260px] overflow-hidden">
            <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.72))]" />
          </div>
          <div className="flex flex-col justify-end p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#ffc570] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#1a3263]">{taskLabel}</span>
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/78">{category}</span>
            </div>
            <h2 className="mt-4 line-clamp-3 text-3xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-4xl">{post.title}</h2>
            {summary ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/66">{summary}</p> : null}
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#ffc570]">Open result <ArrowRight className="h-4 w-4" /></span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 1) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#112851] shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffc570]">{taskLabel}</p>
          <h2 className="mt-3 line-clamp-3 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h2>
          {summary ? <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/62">{summary}</p> : null}
        </div>
      </Link>
    )
  }

  if (variant === 2) {
    return (
      <Link href={href} className="group grid overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0f2144] shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 sm:grid-cols-[160px_minmax(0,1fr)]">
        <div className="relative min-h-[180px] overflow-hidden">
          <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffc570]">{category}</p>
          <h2 className="mt-3 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.05em] text-white">{post.title}</h2>
          {summary ? <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/62">{summary}</p> : null}
        </div>
      </Link>
    )
  }

  if (variant === 3) {
    return (
      <Link href={href} className="group block rounded-[1.8rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ffc570]">{taskLabel}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{category}</span>
        </div>
        <h2 className="mt-8 line-clamp-3 text-3xl font-black leading-[0.98] tracking-[-0.06em] text-white">{post.title}</h2>
        {summary ? <p className="mt-5 line-clamp-4 text-sm leading-7 text-white/62">{summary}</p> : null}
        <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/56 group-hover:text-[#ffc570]">Read more <ArrowRight className="h-4 w-4" /></span>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#112851] shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
        <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/82">{taskLabel}</span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="line-clamp-2 text-xl font-black leading-tight tracking-[-0.04em] text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,197,112,0.14),transparent_22%),linear-gradient(180deg,#0f2144_0%,#112851_42%,#090706_100%)] text-[#efd2b0]">
        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,197,112,0.16),rgba(17,40,81,0.96))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffc570]">{pagesContent.search.hero.badge}</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.08em] text-white sm:text-7xl">
                {pagesContent.search.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">{pagesContent.search.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  <Sparkles className="h-4 w-4 text-[#ffc570]" /> Visual discovery
                </span>
                <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  Editorial results
                </span>
                <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  Filtered archive
                </span>
              </div>
            </div>

            <form action="/search" className="rounded-[2.1rem] border border-white/10 bg-[#0f2144] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:p-6">
              <input type="hidden" name="master" value="1" />
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white/46">
                <Search className="h-4 w-4 text-[#ffc570]" /> Search the archive
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                <Search className="h-5 w-5 text-white/42" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-base font-bold text-white outline-none placeholder:text-white/34"
                />
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                  <Filter className="h-4 w-4 text-white/42" />
                  <input
                    name="category"
                    defaultValue={category}
                    placeholder="Category"
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/34"
                  />
                </label>
                <select name="task" defaultValue={task} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white outline-none">
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[1.2rem] bg-[#ffc570] px-6 text-sm font-black uppercase tracking-[0.18em] text-[#1a3263] transition hover:-translate-y-0.5"
                type="submit"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/46">{results.length} results</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">
                {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <Link href="/image" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
              Browse visuals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {results.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <SearchResultCard key={post.id || post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-white/14 bg-white/4 p-10 text-center">
              <p className="text-2xl font-black tracking-[-0.04em] text-white">No matching posts found.</p>
              <p className="mt-3 text-sm leading-7 text-white/58">Try a different keyword, task type, or category.</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
