'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth-mock';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-50 text-ink-500">
        <span className="text-small">Carregando…</span>
      </div>
    );
  }
  return <>{children}</>;
}
