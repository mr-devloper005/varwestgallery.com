import type { CSSProperties } from 'react'

export const editableRootStyle = {
  '--slot4-page-bg': '#090706',
  '--slot4-page-text': '#efd2b0',
  '--slot4-panel-bg': '#12264c',
  '--slot4-surface-bg': '#132a54',
  '--slot4-muted-text': '#d7c1a7',
  '--slot4-soft-muted-text': '#a9bfd1',
  '--slot4-accent': '#ffc570',
  '--slot4-accent-fill': '#547792',
  '--slot4-accent-soft': '#1a3263',
  '--slot4-dark-bg': '#08142d',
  '--slot4-dark-text': '#efd2b0',
  '--slot4-media-bg': '#17345f',
  '--slot4-cream': '#0f2144',
  '--slot4-warm': '#0b1a37',
  '--slot4-lavender': '#112851',
  '--slot4-gray': '#10213f',
  '--slot4-body-gradient': 'radial-gradient(circle at top, rgba(255,197,112,0.22) 0%, rgba(84,119,146,0.22) 25%, rgba(26,50,99,0.5) 48%, #090706 100%)',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-white/10',
  darkBorder: 'border-white/12',
  shadow: 'shadow-[0_20px_60px_rgba(0,0,0,0.28)]',
  shadowStrong: 'shadow-[0_28px_100px_rgba(0,0,0,0.42)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.78))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8',
    sectionY: 'py-14 sm:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[140px] shrink-0 snap-start sm:w-[160px]',
  },
  type: {
    eyebrow: 'text-xs font-extrabold uppercase tracking-[0.18em]',
    heroTitle: 'text-4xl font-black leading-[1.02] tracking-[-0.06em] sm:text-5xl lg:text-[4.5rem]',
    sectionTitle: 'text-3xl font-black tracking-[-0.05em] sm:text-4xl lg:text-5xl',
    body: 'text-base leading-relaxed',
  },
  surface: {
    card: `rounded-[1.8rem] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[1.8rem] border ${editablePalette.border} ${editablePalette.surfaceBg}`,
    dark: `rounded-2xl ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
  },
  button: {
    primary: `inline-flex items-center justify-center rounded-full bg-[var(--slot4-page-text)] px-8 py-3.5 text-sm font-bold text-[var(--slot4-dark-bg)] transition hover:-translate-y-0.5 hover:opacity-95`,
    secondary: `inline-flex items-center justify-center rounded-full border ${editablePalette.border} bg-white/5 px-8 py-3.5 text-sm font-bold ${editablePalette.surfaceText} transition hover:bg-white/10`,
    accent: `inline-flex items-center justify-center rounded-full ${editablePalette.accentBg} px-8 py-3.5 text-sm font-bold text-[var(--slot4-page-text)] transition hover:-translate-y-0.5 hover:opacity-95`,
  },
  media: {
    frame: `relative overflow-hidden rounded-xl ${editablePalette.mediaBg}`,
    ratio: 'aspect-[2/3]',
  },
  motion: {
    lift: 'transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(0,0,0,0.14)]',
    fade: 'transition duration-300 hover:opacity-80',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; all homepage sections consume those CSS variables.',
  'Keep page structure in src/editable/sections/HomeSections.tsx so AI can redesign the whole home experience in one file.',
  'Use wide readable grids; never create skinny columns for paragraphs or cards.',
  'Use horizontal rails for dense post browsing, like the MysteryCoder reference layout.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
