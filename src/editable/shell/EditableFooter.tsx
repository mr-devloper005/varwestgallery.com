'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const { session, logout } = useEditableLocalAuthSession()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-[#0f2144] text-[#efd2b0]">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#1a3263] p-0.5">
                <img src="/favicon.png" alt={SITE_CONFIG.name} className="h-full w-full object-contain" />
              </span>
              <span className="text-lg font-black tracking-[-0.04em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ffc570]">Curated discovery</p>
            <h2 className="mt-4 max-w-md text-3xl font-black leading-tight tracking-[-0.05em]">
              Visual collections and polished submissions in one refined browsing space.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/66">
              {globalContent.footer?.description || SITE_CONFIG.description}
            </p>
          </div>

          

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/48">Sections</h3>
            <div className="mt-4 grid gap-3">
              <Link href="/search" className="text-sm font-bold text-white/72 transition hover:text-white">Search</Link>
              <Link href="/about" className="text-sm font-bold text-white/72 transition hover:text-white">About</Link>
              <Link href="/contact" className="text-sm font-bold text-white/72 transition hover:text-white">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/48">Account</h3>
            <div className="mt-4 grid gap-3">
              {session ? (
                <>
                  <Link href="/create" className="text-sm font-bold text-white/72 transition hover:text-white">Upload</Link>
                  <button type="button" onClick={logout} className="text-left text-sm font-bold text-white/72 transition hover:text-white">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-white/72 transition hover:text-white">Login</Link>
                  <Link href="/signup" className="text-sm font-bold text-white/72 transition hover:text-white">Join</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE_CONFIG.name} © {year}. All rights reserved.</p>
          <p>{globalContent.footer?.bottomNote || 'Curated for clean discovery and elegant browsing.'}</p>
        </div>
      </div>
    </footer>
  )
}
