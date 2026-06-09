import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, LayoutGrid, UserPlus } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,197,112,0.16),transparent_22%),linear-gradient(180deg,#112851_0%,#0f2144_38%,#090706_100%)] text-[#efd2b0]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[1440px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="rounded-[2.2rem] border border-white/10 bg-[#f2e4cf] p-6 text-[#1a3263] shadow-[0_30px_100px_rgba(0,0,0,0.18)] sm:p-8">
            <h1 className="text-3xl font-black tracking-[-0.05em]">{pagesContent.auth.signup.formTitle}</h1>
            <p className="mt-3 text-sm leading-7 text-[#1a3263]/72">Create your account to unlock submissions, profile access, and creator-side actions.</p>
            <EditableLocalSignupForm />
            <p className="mt-6 text-sm text-[#1a3263]/70">
              Already have an account?{' '}
              <Link href="/login" className="inline-flex items-center gap-2 font-black text-[#1a3263] underline-offset-4 hover:underline">
                {pagesContent.auth.signup.loginCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffc570]">{pagesContent.auth.signup.badge}</p>
            <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.08em] text-white sm:text-6xl">
              {pagesContent.auth.signup.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/70">{pagesContent.auth.signup.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <UserPlus className="h-5 w-5 text-[#ffc570]" />
                <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">Fast onboarding</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Set up a local account in seconds and move straight into the content workflow.</p>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                <LayoutGrid className="h-5 w-5 text-[#ffc570]" />
                <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">One connected workspace</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Keep submission tools, profile pages, and creation actions in one unified account experience.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
