import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SubscManager - サブスクリプション管理アプリ',
  description:
    'Netflix、Spotify、Amazon Primeなど、すべてのサブスクリプションを一元管理。支払い予定日、月額費用、カテゴリー別分析で家計をスマートに管理できます。',
  keywords:
    'サブスクリプション, 管理, Netflix, Spotify, Amazon Prime, 家計管理, 支払い管理',
  authors: [{ name: 'SubscManager Team' }],
  creator: 'SubscManager',
  publisher: 'SubscManager',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://subsc-manager.vercel.app'),
  icons: {
    icon: '/subtrack_icon.png',
    shortcut: '/subtrack_icon.png',
    apple: '/subtrack_icon.png',
  },
  openGraph: {
    title: 'SubscManager - サブスクリプション管理アプリ',
    description:
      'すべてのサブスクリプションを一元管理。支払い予定日、月額費用、カテゴリー別分析で家計をスマートに管理。',
    url: 'https://subsc-manager.vercel.app',
    siteName: 'SubscManager',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SubscManager - サブスクリプション管理アプリ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubscManager - サブスクリプション管理アプリ',
    description:
      'すべてのサブスクリプションを一元管理。支払い予定日、月額費用、カテゴリー別分析で家計をスマートに管理。',
    images: ['/og-image.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/subtrack_icon.png" />
        <link rel="apple-touch-icon" href="/subtrack_icon.png" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
