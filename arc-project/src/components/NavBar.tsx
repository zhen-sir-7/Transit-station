'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'CHAT' },
  { href: '/audit', label: 'AUDIT' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-arc-border"
      style={{ background: '#0B0C10', height: 56 }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-4 md:px-6" style={{ maxWidth: 1400 }}>
        {/* Brand */}
        <Link href="/" className="font-mono text-lg font-bold tracking-[0.1em] text-arc-text select-none">
          AR<span className="text-arc-accent">C</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-demo-target={link.href === '/audit' ? 'nav-audit' : undefined}
                className={
                  'font-mono text-sm font-medium tracking-[0.05em] px-4 py-2 transition-all duration-200 uppercase ' +
                  (isActive
                    ? 'text-arc-accent border-b border-arc-accent'
                    : 'text-arc-text-secondary hover:text-arc-text')
                }
                style={{ marginBottom: -1 }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 text-arc-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-arc-border" style={{ background: '#0B0C10' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={
                  'block font-mono text-sm font-medium tracking-[0.05em] px-4 py-3 uppercase transition-colors duration-200 ' +
                  (isActive ? 'text-arc-accent' : 'text-arc-text-secondary hover:text-arc-text')
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
