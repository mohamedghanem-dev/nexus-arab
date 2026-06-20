'use client';
// components/Providers.tsx
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply saved theme
    const saved = localStorage.getItem('nexus-theme') ?? 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;

  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--c-bg2)',
            color: 'var(--c-text)',
            border: '1px solid var(--c-border)',
            fontFamily: 'var(--font-cairo)',
          },
        }}
      />
    </>
  );
}
