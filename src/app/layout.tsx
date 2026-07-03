import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'The Reveal — Intimacy & Connection Game for Couples',
    template: '%s | The Reveal',
  },
  description: 'Explore, communicate, and deepen your connection. The Reveal is an interactive game for discovering intimate positions and relationships slowly and mindfully.',
  keywords: [
    'couples game',
    'intimacy game',
    'intimate positions',
    'relationship builder',
    'couples connection',
    'scratch card game',
    'romance game',
    'relationship communication',
    'mindful intimacy',
    'relationship app',
    'connection builder',
    'sensual game'
  ],
  authors: [{ name: 'The Reveal Team' }],
  creator: 'The Reveal Team',
  publisher: 'The Reveal',
  metadataBase: new URL('https://thereveal.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thereveal.app',
    title: 'The Reveal — Discover Intimate Positions & Connect Deeply',
    description: 'An interactive couples game for exploring intimacy, communication, and closeness slowly and mindfully.',
    siteName: 'The Reveal',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Reveal — Tactile Intimacy & Discovery Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Reveal — Discover Intimate Positions & Connect Deeply',
    description: 'An interactive couples game for exploring intimacy, communication, and closeness slowly and mindfully.',
    images: ['/images/og-image.png'],
    creator: '@therevealapp',
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
  category: 'Entertainment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-surface text-contrast">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
