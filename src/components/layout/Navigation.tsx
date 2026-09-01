'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  BarChart3,
  Zap,
  Menu,
  X,
  Flame,
  Trophy,
  Sparkles,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useStore } from '@/lib/store';
import { PockEdLogo } from '@/components/brand/PockEdLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Today\'s focus' },
  { name: 'Decks', href: '/decks', icon: Layers, description: 'Flashcards' },
  { name: 'Sprint', href: '/sprint', icon: Zap, description: 'Start a session' },
  { name: 'Stats', href: '/stats', icon: BarChart3, description: 'Your progress' },
];

export function Navigation() {
  const pathname = usePathname();
  const { stats } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-nav border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link
            href="/dashboard"
            className="flex items-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PockEdLogo variant="full" size="sm" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[var(--card)] border-r border-[var(--border)] shadow-xl flex flex-col"
            >
              <div className="px-6 pt-5 pb-4 border-b border-[var(--border)] flex items-center justify-between">
                <PockEdLogo variant="full" size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-pocked-gradient text-white shadow-md shadow-indigo-500/25'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                      )}
                    >
                      <span
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--card)] group-hover:text-[var(--primary)]'
                        )}
                      >
                        <item.icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col">
                        <span className="leading-tight">{item.name}</span>
                        <span
                          className={cn(
                            'text-[11px] font-normal',
                            isActive ? 'text-white/80' : 'text-[var(--muted-foreground)]'
                          )}
                        >
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-[var(--border)]">
                <div className="p-4 rounded-2xl bg-pocked-gradient-soft border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        Streak
                      </span>
                    </div>
                    <Sparkles className="w-4 h-4 text-[var(--pocked-purple,#7C3AED)]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="numeric text-2xl text-[var(--foreground)]">
                      {stats.currentStreak}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">day{stats.currentStreak === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Trophy className="w-3.5 h-3.5 text-[var(--pocked-amber,#F59E0B)]" />
                    <span className="numeric">{stats.totalXP.toLocaleString()}</span>
                    <span>total XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:flex lg:flex-col glass-nav border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="px-6 py-5 border-b border-[var(--border)] hover:opacity-80 transition-opacity"
          >
            <PockEdLogo variant="full" size="md" />
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Menu
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-pocked-gradient text-white shadow-md shadow-indigo-500/20'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  <span
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--card)] group-hover:text-[var(--primary)] group-hover:shadow-sm'
                    )}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="leading-tight">{item.name}</span>
                    <span
                      className={cn(
                        'text-[11px] font-normal',
                        isActive ? 'text-white/80' : 'text-[var(--muted-foreground)]'
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Stats summary */}
          <div className="p-3 border-t border-[var(--border)]">
            <div className="p-4 rounded-2xl bg-pocked-gradient-soft border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Current Streak
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="numeric text-2xl text-[var(--foreground)]">
                  {stats.currentStreak}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  day{stats.currentStreak === 1 ? '' : 's'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="numeric text-[var(--foreground)]">
                    {stats.totalXP.toLocaleString()}
                  </span>
                  <span>XP</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] justify-end">
                  <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="numeric text-[var(--foreground)]">
                    {stats.totalSprints}
                  </span>
                  <span>sprints</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
