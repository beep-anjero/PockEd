'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BarChart3, Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Decks', href: '/decks', icon: BookOpen },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const { stats } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">PockEd</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl transform transition-transform">
            <div className="flex flex-col h-full pt-16">
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      )}
                    >
                      <item.icon className="w-5 h-5" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                  <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{stats.currentStreak} day streak</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-500">{stats.totalXP} XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:flex lg:flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">PockEd</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Stats summary */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                  {stats.currentStreak} day streak
                </p>
                <p className="text-xs text-indigo-500 dark:text-indigo-500">{stats.totalXP} XP</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSprints}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sprints</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCardsReviewed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cards</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}