import type { Metadata } from 'next';
import CookieBanner from '@/components/CookieBanner';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bauuu - Dating per amanti dei cani',
  description: 'L\'app di dating per chi ama i cani. Trova l\'amore attraverso il tuo migliore amico a quattro zampe.',
  manifest: '/manifest.json',
  themeColor: '#E8533C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bauuu',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-background text-gray-900 safe-area-top safe-area-bottom">
        <a href="#main-content" className="skip-link">
          Salta al contenuto
        </a>
        <main id="main-content">
          {children}
        </main>
        <CookieBanner />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}