// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexus Arab | نُشيد الأعمال الرقمية للمستقبل',
  description: 'وكالة تقنية متكاملة لبناء المواقع الفاخرة، تطبيقات الموبايل، والأنظمة الإدارية العملاقة.',
  keywords: ['موقع ويب', 'تطبيقات', 'أنظمة إدارية', 'Nexus Arab', 'تطوير برمجيات', 'Next.js'],
  authors: [{ name: 'Nexus Arab' }],
  creator: 'Nexus Arab',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexus Arab',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    title: 'Nexus Arab | نُشيد الأعمال الرقمية للمستقبل',
    description: 'وكالة تقنية متكاملة لبناء المواقع والأنظمة والتطبيقات',
    siteName: 'Nexus Arab',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${cairo.variable} font-arabic antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
