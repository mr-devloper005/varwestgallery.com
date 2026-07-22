import Link from 'next/link'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { buildPostUrl, fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const dedupeUrls = (urls: Array<string | null | undefined>): string[] =>
  Array.from(new Set(urls.map((url) => (typeof url === 'string' ? url.trim() : '')).filter((url) => url.length > 0)))

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return dedupeUrls([...media, ...images, ...singleImages]).filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const stripHtml = (value: string) =>
  value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()

const summaryText = (post: SitePost) => {
  const raw = post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt)
  const clean = raw ? stripHtml(raw) : ''
  return clean || 'Open this entry for more details.'
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

function getFallbackImage(post: SitePost) {
  return getImages(post)[0] || '/placeholder.svg?height=900&width=1200'
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const detailVars = {
    '--detail-bg': '#090706',
    '--detail-text': '#efd2b0',
    '--detail-surface': '#0f2144',
    '--detail-panel': '#112851',
    '--detail-accent': '#ffc570',
    '--detail-muted': 'rgba(239,210,176,0.64)',
    '--editable-border': 'rgba(239,210,176,0.10)',
  } as CSSProperties

  return (
    <EditableSiteShell>
      <main style={detailVars} className="bg-[var(--detail-bg)] text-[var(--detail-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function DetailShell({
  task,
  post,
  children,
  meta,
}: {
  task: TaskKey
  post: SitePost
  meta?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <BackLink task={task} />
      <div className="mt-8 overflow-hidden rounded-[2.3rem] border border-[var(--editable-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
        <div className="relative min-h-[280px] border-b border-[var(--editable-border)] bg-black">
          <img src={getFallbackImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-62" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.86))]" />
          <div className="relative z-10 flex min-h-[280px] flex-col justify-end p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--detail-accent)]">{categoryOf(post, task)}</p>
            <h1 className="mt-3 max-w-5xl text-4xl font-black leading-[0.98] tracking-[-0.07em] text-white sm:text-6xl">{post.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">{summaryText(post)}</p>
            {meta ? <div className="mt-6">{meta}</div> : null}
          </div>
        </div>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-10">
          {children}
        </div>
      </div>
    </section>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/9">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <DetailShell task="article" post={post}>
      <article className="min-w-0 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-8">
        <BodyContent post={post} />
        <EditableComments slug={post.slug} comments={comments} />
      </article>
      <RelatedPanel task="article" post={post} related={related} />
    </DetailShell>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <DetailShell
      task="listing"
      post={post}
      meta={<InfoBar values={[address, phone, website].filter(Boolean) as string[]} />}
    >
      <article className="min-w-0 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-8">
        <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
        <BodyContent post={post} />
        <ImageStrip images={images.slice(1)} label="Business showcase" />
      </article>
      <aside className="space-y-5">
        {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
        <ContactAction website={website} phone={phone} email={email} />
        <RelatedPanel task="listing" post={post} related={related} compact />
      </aside>
    </DetailShell>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <DetailShell task="classified" post={post} meta={<InfoBar values={[price, condition, location].filter(Boolean) as string[]} />}>
      <article className="min-w-0 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {price ? <BadgeLine label="Price" value={price} /> : null}
          {condition ? <BadgeLine label="Condition" value={condition} /> : null}
          {location ? <BadgeLine label="Location" value={location} /> : null}
        </div>
        <ImageStrip images={images} label="Offer visuals" large />
        <BodyContent post={post} />
        <ContactAction website={website} phone={phone} email={email} />
      </article>
      <RelatedPanel task="classified" post={post} related={related} />
    </DetailShell>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  const leadImage = gallery[0]
  const supportImages = gallery.slice(1)
  const category = categoryOf(post, 'Image')
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <BackLink task="image" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-[2.2rem] border border-[var(--editable-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.24)] lg:sticky lg:top-24 lg:self-start sm:p-6">
          <div className="overflow-hidden rounded-[1.7rem] border border-[var(--editable-border)] bg-black/25">
            <img src={leadImage} alt={post.title} className="aspect-[4/5] w-full object-cover" />
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--detail-accent)]">
            <Camera className="h-4 w-4" /> Curated image entry
          </div>
          <h1 className="mt-4 text-3xl font-black leading-[1.02] tracking-[-0.06em] text-white sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-sm leading-7 text-white/68">{summaryText(post)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              {category}
            </span>
            <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              {gallery.length} image{gallery.length === 1 ? '' : 's'}
            </span>
            {post.publishedAt ? (
              <span className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
                {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          {supportImages.length ? (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {supportImages.slice(0, 6).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt=""
                  className="aspect-square rounded-[1rem] border border-[var(--editable-border)] object-cover"
                />
              ))}
            </div>
          ) : null}
          <div className="mt-6 rounded-[1.5rem] border border-[var(--editable-border)] bg-white/4 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/48">Viewing notes</p>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Built as a visual-first presentation with a stronger collector feel, cleaner spacing, and a more premium reading rhythm.
            </p>
          </div>
        </aside>

        <div className="grid gap-6">
          <article className="overflow-hidden rounded-[2.2rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] shadow-[0_30px_100px_rgba(0,0,0,0.24)]">
            <div className="relative min-h-[340px] border-b border-[var(--editable-border)] bg-black sm:min-h-[460px]">
              <img src={leadImage} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-84" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,38,0.08),rgba(7,12,27,0.82))]" />
              <div className="relative z-10 flex min-h-[340px] flex-col justify-end p-6 sm:min-h-[460px] sm:p-8 lg:p-10">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[var(--detail-accent)]">Featured frame</p>
                <h2 className="mt-3 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.07em] text-white sm:text-5xl">
                  {post.title}
                </h2>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              {supportImages.length ? (
                <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                  <figure className="overflow-hidden rounded-[1.7rem] border border-[var(--editable-border)] bg-black/20">
                    <img src={supportImages[0]} alt="" className="aspect-[16/10] w-full object-cover" />
                    <figcaption className="p-4 text-sm font-bold text-white/62">Secondary image from this collection.</figcaption>
                  </figure>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-1">
                    {supportImages.slice(1, 3).map((image, index) => (
                      <img key={`${image}-${index}`} src={image} alt="" className="aspect-[5/4] rounded-[1.4rem] border border-[var(--editable-border)] object-cover" />
                    ))}
                  </div>
                </div>
              ) : null}

              {gallery.length > 3 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {gallery.slice(3).map((image, index) => (
                    <figure
                      key={`${image}-${index}`}
                      className={`overflow-hidden rounded-[1.5rem] border border-[var(--editable-border)] bg-black/18 ${
                        index % 4 === 0 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <img src={image} alt="" className={`w-full object-cover ${index % 4 === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`} />
                    </figure>
                  ))}
                </div>
              ) : null}

              <BodyContent post={post} compact />
            </div>
          </article>

          <RelatedPanel task="image" post={post} related={related} />
        </div>
      </div>
    </section>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <DetailShell task="sbm" post={post}>
      <article className="min-w-0 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-8">
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#ffc570] px-5 py-3 text-sm font-black text-[#1a3263]">
            Open saved resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedPanel task="sbm" post={post} related={related} />
    </DetailShell>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <DetailShell task="pdf" post={post}>
      <article className="min-w-0 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:p-8">
        <BodyContent post={post} />
        {fileUrl ? (
          <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-[var(--editable-border)] bg-black/20">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--editable-border)] p-4">
              <span className="text-sm font-black">Document preview</span>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#ffc570] px-4 py-2 text-xs font-black text-[#1a3263]">
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
            <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full" />
          </div>
        ) : null}
      </article>
      <RelatedPanel task="pdf" post={post} related={related} />
    </DetailShell>
  )
}

function ProfileDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const primaryImage = images[0]
  const summary = summaryText(post)
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mt-8 rounded-[2.2rem] border border-[var(--editable-border)] bg-[#f4e8d6] p-6 text-black shadow-[0_30px_100px_rgba(0,0,0,0.16)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-[#1a3263]/10 bg-white/72 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <div className="relative">
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-[#1a3263]/10 bg-white">
                {primaryImage ? <img src={primaryImage} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[#547792]" />}
              </div>
              
            </div>

            <h1 className="mt-6 text-center text-3xl font-black leading-tight tracking-[-0.05em]">{post.title}</h1>
            {role ? <p className="mt-2 text-center text-xs font-black uppercase tracking-[0.18em] text-[#547792]">{role}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-0 overflow-hidden rounded-[1.25rem] border border-[#1a3263]/10">
              
              
            </div>

            <div className="mt-5 flex gap-3">
              <Link href='/login' className="inline-flex h-12 flex-1 items-center justify-center rounded-[1rem] bg-[#ff3b30] px-4 text-sm font-black text-white">
                Follow
              </Link>
              
            </div>
          </aside>

          <div className="min-w-0">
            
            <section className="border-b border-[#1a3263]/12 py-8">
              <h3 className="text-3xl font-black leading-none tracking-[-0.04em]">About</h3>
              <div className="mt-5 flex flex-wrap gap-6 text-sm font-bold text-black">
              </div>
            </section>

            <section className="py-8">
              <div className="max-w-4xl text-lg leading-9 text-black [&_.article-content]:text-black [&_.article-content_a]:text-[#2d6df6] [&_.article-content_p]:text-black [&_.article-content_strong]:text-black [&_.article-content_*]:!text-black">
                {summary ? '' : null}
                <BodyContent post={post} compact />
              </div>
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-lg font-black text-[#2d6df6] underline underline-offset-4">
                  {post.title}
                </Link>
              ) : null}
            </section>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.7rem] border border-[#1a3263]/10 bg-white/72 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#547792]">Quick contact</p>
                <div className="mt-4 grid gap-3 text-sm font-bold text-[#1a3263]/78">
                  {website ? <p>Website available</p> : null}
                  {email ? <p>Email available</p> : null}
                  {phone ? <p>Phone available</p> : null}
                  {!website && !email && !phone ? <p>No direct contact details shared.</p> : null}
                </div>
                <div className="mt-5">
                  <ContactAction website={website} phone={phone} email={email} />
                </div>
              </div>
               </div>

            {images.slice(1).length ? <div className="mt-8"><ImageStrip images={images.slice(1)} label="Profile gallery" labelClassName="text-black" /></div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none ${compact ? 'text-base leading-8' : 'text-lg leading-9'} opacity-90`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoBar({ values }: { values: string[] }) {
  if (!values.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span key={value} className="rounded-full border border-white/12 bg-black/24 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/80">
          {value}
        </span>
      ))}
    </div>
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.4rem] border border-[var(--editable-border)] bg-white/4 p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/48">
            <Icon className="h-4 w-4" /> {label}
          </div>
          <p className="mt-2 break-words text-sm font-bold leading-6 text-white/78">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false, labelClassName = 'text-[var(--detail-accent)]' }: { images: string[]; label: string; large?: boolean; labelClassName?: string }) {
  if (!images.length) return null
  return (
    <section className="mt-8">
      <p className={`text-xs font-black uppercase tracking-[0.22em] ${labelClassName}`}>{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.3rem] object-cover ring-1 ring-[var(--editable-border)]" />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-2 p-4 text-sm font-black"><MapPin className="h-4 w-4" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-80 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="rounded-[1.8rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/46">Quick actions</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#ffc570] px-4 py-2 text-sm font-black text-[#1a3263]">Website <ExternalLink className="h-4 w-4" /></Link> : null}
        {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm font-black"><Phone className="h-4 w-4" /> Call</a> : null}
        {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2 text-sm font-black"><Mail className="h-4 w-4" /> Email</a> : null}
      </div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[var(--editable-border)] bg-white/5 px-4 py-3 text-sm">
      <span className="font-black uppercase tracking-[0.16em] text-white/50">{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related, compact = false }: { task: TaskKey; post: SitePost; related: SitePost[]; compact?: boolean }) {
  const taskConfig = getTaskConfig(task)
  return (
    <aside className="min-w-0 space-y-5">
      {!compact ? (
        <div className="rounded-[1.8rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/46">About this post</p>
          <div className="mt-4 grid gap-3 text-sm font-bold text-white/72">
            <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4" /> Task: {taskConfig?.label || task}</p>
            <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Site: {SITE_CONFIG.name}</p>
            {post.publishedAt ? <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p> : null}
          </div>
        </div>
      ) : null}
      {related.length ? (
        <div className="rounded-[1.8rem] border border-[var(--editable-border)] bg-[var(--detail-surface)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black tracking-[-0.04em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-black uppercase tracking-[0.16em] text-white/46">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  return (
    <Link href={buildPostUrl(task, post.slug)} className="group flex gap-3 rounded-[1.2rem] border border-[var(--editable-border)] bg-white/4 p-3 transition duration-300 hover:bg-white/8">
      {image && task !== 'sbm' ? (
        <img src={image} alt={post.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white/5">
          {task === 'listing' ? <Building2 className="h-6 w-6 text-white/36" /> : null}
          {task === 'image' ? <Camera className="h-6 w-6 text-white/36" /> : null}
          {task === 'profile' ? <UserRound className="h-6 w-6 text-white/36" /> : null}
          {task === 'sbm' ? <Bookmark className="h-6 w-6 text-white/36" /> : null}
          {task === 'pdf' ? <FileText className="h-6 w-6 text-white/36" /> : null}
          {task === 'classified' ? <Tag className="h-6 w-6 text-white/36" /> : null}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="line-clamp-3 text-sm font-black leading-tight tracking-[-0.03em] text-white">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/54">{summaryText(post)}</p>
      </div>
    </Link>
  )
}

function EditableComments({ slug, comments }: { slug: string; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <section className="mt-10 rounded-[1.8rem] border border-[var(--editable-border)] bg-white/4 p-5">
      <div className="flex items-center gap-2 text-lg font-black"><MessageCircle className="h-5 w-5" /> Comments</div>
      <div className="mt-5 grid gap-3">
        {comments.slice(0, 5).map((comment) => (
          <div key={comment.id} className="rounded-[1.2rem] border border-[var(--editable-border)] bg-black/18 p-4">
            <p className="text-sm font-black text-white">{comment.name}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{comment.comment}</p>
          </div>
        ))}
        {!comments.length ? <p className="text-sm text-white/56">No comments yet for {slug}.</p> : null}
      </div>
    </section>
  )
}
