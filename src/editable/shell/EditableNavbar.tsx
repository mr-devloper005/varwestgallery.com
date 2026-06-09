'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

function navLabel(pathname: string) {
  if (pathname.startsWith('/image')) return 'Images'
  if (pathname.startsWith('/article')) return 'Stories'
  if (pathname.startsWith('/listing')) return 'Studios'
  return 'Explore'
}

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navVars = {
    '--editable-nav-bg': '#112851',
    '--editable-nav-text': '#efd2b0',
    '--editable-nav-subtle': 'rgba(239,210,176,0.72)',
    '--editable-border': 'rgba(239,210,176,0.10)',
    '--editable-container': '1440px',
  } as CSSProperties

  const taskNav = useMemo(
    () =>
      SITE_CONFIG.tasks
        .filter((task) => task.enabled && task.key !== 'profile')
        .map((task) => ({ label: task.label, href: task.route })),
    []
  )

  return (
    <header style={navVars} className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/96 text-[var(--editable-nav-text)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[var(--editable-container)]">
        <nav className="flex min-h-[58px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-black">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-[#1a3263] p-0.5">
              <img src="/favicon.png" alt={SITE_CONFIG.name} className="h-full w-full object-contain" />
            </span>
            <span className="text-base tracking-[-0.04em]">{SITE_CONFIG.name}</span>
          </Link>

          

          <div className="ml-auto flex items-center gap-2">
            <Link href="/search" className="hidden rounded-full border border-white/12 px-4 py-2 text-sm font-bold text-[var(--editable-nav-subtle)] transition hover:bg-white/8 hover:text-white md:inline-flex md:items-center md:gap-2">
              <Search className="h-4 w-4" /> Search
            </Link>
            {session ? (
              <>
                <Link href="/create" className="hidden rounded-full bg-[#ffc570] px-4 py-2 text-sm font-bold text-[#1a3263] transition hover:opacity-90 sm:inline-flex sm:items-center sm:gap-2">
                  <PlusCircle className="h-4 w-4" /> Upload
                </Link>
                <button type="button" onClick={logout} className="hidden text-sm font-bold text-[var(--editable-nav-subtle)] transition hover:text-white sm:inline-flex">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-bold text-[var(--editable-nav-subtle)] transition hover:text-white sm:inline-flex sm:items-center sm:gap-2">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link href="/signup" className="hidden rounded-full bg-[#ffc570] px-4 py-2 text-sm font-bold text-[#1a3263] transition hover:opacity-90 sm:inline-flex sm:items-center sm:gap-2">
                  <UserPlus className="h-4 w-4" /> Join
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-full border border-white/12 p-2 text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="border-t border-[var(--editable-border)] px-4 py-4 lg:hidden">
            <form action="/search" className="flex items-center gap-2 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
              <Search className="h-4 w-4 text-[var(--editable-nav-subtle)]" />
              <input
                name="q"
                type="search"
                placeholder="Search images, stories, and collections"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/45"
              />
            </form>
            <div className="mt-4 grid gap-2">
              {[{ label: 'Home', href: '/' }, ...taskNav, { label: 'Contact', href: '/contact' }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold"
                >
                  {item.label}
                </Link>
              ))}
              {session ? (
                <>
                  <Link href="/create" onClick={() => setOpen(false)} className="rounded-[1.25rem] border border-white/10 bg-[#ffc570] px-4 py-3 text-sm font-bold text-[#1a3263]">
                    Upload
                  </Link>
                  <button type="button" onClick={logout} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="rounded-[1.25rem] border border-white/10 bg-[#ffc570] px-4 py-3 text-sm font-bold text-[#1a3263]">
                    Join
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/42">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </p>
          </div>
        ) : null}
      </div>
    </header>
  )
}
