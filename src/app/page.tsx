'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/') {
      router.push('/dashboard');
    }
  }, [pathname, router]);

  return null;
}