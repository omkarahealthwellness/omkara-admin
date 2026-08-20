import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartSheet } from '@/components/cart/cart-sheet';
import { StorefrontHydrator } from '@/components/layout/storefront-hydrator';
import { MobileNav } from '@/components/layout/mobile-nav';
import Script from 'next/script';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari'],
  weight: ['400', '500', '700'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Omkara - Premium Health & Wellness',
    default: 'Omkara - Premium Health & Wellness from Bikaner',
  },
  description:
    'Discover Omkara\'s range of premium, authentically sourced health foods from Bikaner. Fresh sprouts, organic lentils, and wellness products delivered to your doorstep.',
  keywords: ['omkara', 'premium health food', 'organic sprouts', 'bikaner', 'wellness', 'healthy food delivery', 'natural food', 'lentils', 'indian health food'],
  authors: [{ name: 'Omkara Health & Wellness' }],
  alternates: {
    canonical: 'https://omkara-store.pages.dev',
  },
  openGraph: {
    title: 'Omkara - Premium Health & Wellness from Bikaner',
    description:
      'Authentically sourced, minimally processed premium health foods. Fresh sprouts, organic lentils, and more.',
    url: 'https://omkara-store.pages.dev',
    siteName: 'Omkara',
    images: [
      {
        url: '/images/hero_bg.webp',
        width: 1200,
        height: 630,
        alt: 'Omkara Premium Health & Wellness',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omkara - Premium Health & Wellness from Bikaner',
    description: 'Authentically sourced premium health foods delivered to your doorstep.',
    images: ['/images/hero_bg.webp'],
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${notoSansDevanagari.variable} h-full antialiased`}>
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
