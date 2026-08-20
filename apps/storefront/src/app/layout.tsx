import type { Metadata } from 'next';
import { Manrope, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartSheet } from '@/components/cart/cart-sheet';
import { StorefrontHydrator } from '@/components/layout/storefront-hydrator';
import { MobileNav } from '@/components/layout/mobile-nav';
import Script from 'next/script';

export const runtime = 'edge';

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Omkara',
    default: 'Omkara - Premium Quality Goods',
  },
  description:
    'Authentically sourced, minimally processed premium goods crafted for your well-being.',
  keywords: ['premium', 'organic', 'sprouts', 'healthy', 'omkara', 'bikaner'],
  authors: [{ name: 'Omkara' }],
  openGraph: {
    title: 'Omkara - Premium Quality Goods',
    description:
      'Authentically sourced, minimally processed premium goods crafted for your well-being.',
    url: 'https://omkara-store.pages.dev',
    siteName: 'Omkara',
    images: [
      {
        url: '/images/hero_bg.webp',
        width: 1200,
        height: 630,
        alt: 'Omkara Premium',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        <CartSheet />
        <StorefrontHydrator />
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token":"${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || ''}"}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
