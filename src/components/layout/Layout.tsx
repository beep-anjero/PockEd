'use client';

import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { cn } from '@/lib/cn';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <main className={cn('transition-all duration-300', 'lg:ml-64')}>
        <div className="lg:pt-0 pt-16 lg:pl-0 pl-0">
          {children}
        </div>
      </main>
    </div>
  );
}