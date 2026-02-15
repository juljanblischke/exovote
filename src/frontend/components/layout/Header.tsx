'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';
import { useTheme } from 'next-themes';
import { Vote, Menu, X, Sun, Moon } from 'lucide-react';

export function Header() {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/polls', label: t('polls') },
    { href: '/polls/create', label: t('create') },
  ];

  const switchLocale = (targetLocale: string) => {
    router.replace(pathname, { locale: targetLocale as 'de' | 'en' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="relative px-4 sm:px-6 lg:px-8 xl:px-12">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-10">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Vote className="w-5 h-5 text-[var(--primary-foreground)]" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-[var(--primary)]">Exo</span>
              <span className="text-[var(--foreground)]">Vote</span>
            </span>
          </Link>

          {/* Desktop Navigation - Centered pill */}
          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-0.5 p-1.5 rounded-full bg-[var(--secondary)]/30 backdrop-blur-sm border border-[var(--border)]/50">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-5 py-2 rounded-full text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/80 hover:shadow-sm transition-all duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 z-10">
            {/* Language Switcher - Pill */}
            <div className="flex items-center p-1 rounded-full bg-[var(--secondary)]/50">
              {(['de', 'en'] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => switchLocale(code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    locale === code
                      ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                  aria-label={code === 'de' ? 'Deutsch' : 'English'}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => mounted && setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-full bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] flex items-center justify-center transition-all duration-200 group"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] flex items-center justify-center transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-lg font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
