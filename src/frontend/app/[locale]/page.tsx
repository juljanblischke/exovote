import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { ArrowRight, ChevronDown, BarChart3, CheckCircle2, Users, Shield } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const nav = useTranslations('navigation');

  return (
    <section className="relative min-h-screen flex items-center pt-20 -mt-16 md:-mt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[var(--background)]">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(225,29,72,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-[var(--primary)]/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[120px] animate-float [animation-delay:-3s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Text Content */}
          <div className="text-left">
            {/* Tagline Badge */}
            <div className="animate-fade-in-up [animation-delay:0.1s] opacity-0 [animation-fill-mode:forwards]">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)] text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse-slow" />
                {t('hero.tagline')}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="animate-fade-in-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
                {t('hero.title')}
              </span>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight text-gradient mt-2 pb-2">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-lg mt-8 animate-fade-in-up [animation-delay:0.3s] opacity-0 [animation-fill-mode:forwards]">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mt-10 animate-fade-in-up [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
              <Link
                href="/polls/create"
                className="gradient-primary inline-flex items-center rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/polls"
                className="glass inline-flex items-center rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Right: Poll Visual Element */}
          <div className="hidden lg:block animate-fade-in [animation-delay:0.5s] opacity-0 [animation-fill-mode:forwards]">
            <div className="relative">
              {/* Background glow */}
              <div className="absolute -inset-16 bg-gradient-to-br from-[var(--primary)]/30 via-[var(--primary)]/20 to-[var(--primary)]/10 rounded-[4rem] blur-[60px] animate-pulse-slow" />
              <div className="absolute -inset-8 bg-gradient-to-tr from-[var(--primary)]/25 via-transparent to-[var(--primary)]/15 rounded-[3rem] blur-2xl" />

              {/* Poll Card */}
              <div className="relative bg-[var(--card)] rounded-xl border border-[var(--primary)]/20 shadow-2xl shadow-[var(--primary)]/20 overflow-hidden w-full max-w-[520px] ml-auto ring-1 ring-[var(--primary)]/10">
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--foreground)]">Team Offsite 2026</div>
                      <div className="text-xs text-[var(--muted-foreground)]">3 {t('hero.liveResults').toLowerCase()}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Poll Options */}
                <div className="p-6 space-y-4">
                  {/* Option 1 - Leading */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--foreground)]">Barcelona</span>
                      <span className="text-[var(--primary)] font-semibold">47%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--secondary)] overflow-hidden">
                      <div className="h-full rounded-full gradient-primary w-[47%] transition-all duration-1000" />
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--foreground)]">Lissabon</span>
                      <span className="text-[var(--muted-foreground)] font-semibold">32%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--secondary)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--primary)]/40 w-[32%] transition-all duration-1000" />
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--foreground)]">Milano</span>
                      <span className="text-[var(--muted-foreground)] font-semibold">21%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--secondary)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--primary)]/20 w-[21%] transition-all duration-1000" />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--secondary)]/30">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <Users className="w-3.5 h-3.5" />
                    <span>19 votes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>GDPR</span>
                  </div>
                </div>
              </div>

              {/* Floating Status Card */}
              <div className="absolute -bottom-6 -left-8 bg-[var(--card)]/90 backdrop-blur rounded-lg border border-[var(--border)] px-4 py-3 flex items-center gap-3 shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{t('hero.voteCast')}</div>
                  <div className="text-sm text-[var(--foreground)] font-medium">+1 Barcelona</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[5%] w-28 h-28 border-2 border-[var(--primary)]/20 rounded-2xl transform rotate-12 hidden xl:block" />
        <div className="absolute bottom-[25%] left-[3%] w-20 h-20 border-2 border-[var(--primary)]/15 rounded-xl transform -rotate-6 hidden xl:block" />
        <div className="absolute top-[55%] left-[8%] w-12 h-12 border-2 border-[var(--primary)]/25 rounded-lg transform rotate-45 hidden xl:block" />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in [animation-delay:1s] opacity-0 [animation-fill-mode:forwards] hidden md:flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">{t('hero.scroll')}</span>
        <div className="w-6 h-10 rounded-full border-2 border-[var(--muted-foreground)] p-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)] mx-auto animate-bounce" />
        </div>
      </div>
    </section>
  );
}
