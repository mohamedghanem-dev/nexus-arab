'use client';
// components/Navbar.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { label: 'الرئيسية',  href: '#hero' },
  { label: 'خدماتنا',   href: '#services' },
  { label: 'مشاريعنا',  href: '#projects' },
  { label: 'آراء العملاء', href: '#testimonials' },
  { label: 'تواصل معنا', href: '#contact' },
];

const DEFAULT_WHATSAPP = '201095097334';

interface Props { whatsappNumber?: string | null; }

export function Navbar({ whatsappNumber }: Props) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme]     = useState<'dark' | 'light'>('dark');
  const whatsapp = whatsappNumber || DEFAULT_WHATSAPP;

  useEffect(() => {
    const saved = (localStorage.getItem('nexus-theme') ?? 'dark') as 'dark' | 'light';
    setTheme(saved);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nexus-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
      style={{ borderBottom: scrolled ? '1px solid var(--c-border)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/icons/icon-192x192.png" alt="Nexus Arab" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-lg tracking-wide" style={{ color: 'var(--c-text)' }}>
            Nexus Arab
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--c-text2)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-accent-lt)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text2)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--c-text3)', background: 'var(--c-glass)' }}
            aria-label="تبديل الثيم"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* CTA */}
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
          >
            ابدأ مشروعك
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--c-text2)' }}
            aria-label="القائمة"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t" style={{ borderColor: 'var(--c-border)' }}>
          <div className="px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium"
                style={{ color: 'var(--c-text2)' }}
              >
                {link.label}
              </a>
            ))}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 py-3 text-center rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--c-accent), var(--c-cyan))' }}
            >
              ابدأ مشروعك
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
