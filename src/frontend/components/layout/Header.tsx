'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Vote } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LangSwitch } from './LangSwitch';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const t = useTranslations('navigation');

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/polls', label: t('polls') },
    { href: '/polls/create', label: t('create') },
  ];

  return (
    <header className="glass sticky top-0 z-50 border-b border-[var(--border)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Vote className="h-7 w-7 text-[var(--primary)]" />
          <span className="text-gradient text-xl font-bold">ExoVote</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LangSwitch />
          <ThemeToggle />
          <div className="md:hidden">
            <MobileMenu navItems={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
