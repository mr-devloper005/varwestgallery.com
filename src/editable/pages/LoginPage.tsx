import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,197,112,0.16),transparent_22%),linear-gradient(180deg,#0f2144_0%,#112851_42%,#090706_100%)] text-[#efd2b0]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[1440px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffc570]">{pagesContent.auth.login.badge}</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.08em] text-white sm:text-6xl">
              {pagesContent.auth.login.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/70">{pagesContent.auth.login.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <ShieldCheck className="h-5 w-5 text-[#ffc570]" />
                <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">Private access</h2>
                <p className="mt-3 text-sm leading-7 text-white/62">Continue to your publishing workspace and account-aware pages without changing the existing local auth flow.</p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <Sparkles className="h-5 w-5 text-[#ffc570]" />
                <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">Clean workflow</h2>
                <p className="mt-3 text-sm leading-7 text-white/62">Use the same account path for submissions, profile access, and creator-side actions across the site.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,197,112,0.16),rgba(17,40,81,0.96))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-8">
            <h2 className="text-3xl font-black tracking-[-0.05em] text-white">{pagesContent.auth.login.formTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/64">Enter your details to return to the dashboard and publishing tools.</p>
            <EditableLocalLoginForm />
            <p className="mt-6 text-sm text-white/66">
              New here?{' '}
              <Link href="/signup" className="inline-flex items-center gap-2 font-black text-[#ffc570] underline-offset-4 hover:underline">
                {pagesContent.auth.login.createCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
