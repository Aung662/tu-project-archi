import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Myanmar } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import { InstallPrompt } from '@/components/InstallPrompt';
import { PageViewTracker } from '@/components/PageViewTracker';
import { BookmarksProvider } from '@/context/BookmarksContext';
import { ThemeProvider, themeInitScript } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { ScrollToTop } from '@/components/ScrollToTop';

// Modern geometric sans for Latin / UI numerals.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

// High-quality Myanmar Unicode face so Burmese text looks crisp, not "heavy".
const myanmar = Noto_Sans_Myanmar({
  subsets: ['myanmar'],
  display: 'swap',
  variable: '--font-myanmar',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TU Project Archive | Title Similarity Checker',
  description:
    'Project archive for Myanmar Technological Universities — search titles, check for similar or duplicate titles, and browse previous projects. A centralized academic archive.',
  applicationName: 'TU Archive',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TU Archive',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0b1220',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${myanmar.variable}`}>
      <head>
        {/* Apply the saved theme before first paint to avoid a flash of the
            wrong theme (FOUC). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* Ambient animated background — sits behind everything */}
        <div className="app-aurora" aria-hidden="true">
          <span className="aurora-blob aurora-1" />
          <span className="aurora-blob aurora-2" />
          <span className="aurora-blob aurora-3" />
          <div className="aurora-grid" />
        </div>

        <ThemeProvider>
        <LanguageProvider>
        <AuthProvider>
          <BookmarksProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
              <Footer />
            </div>
            <WelcomeOverlay />
            <ScrollToTop />
            <InstallPrompt />
            <ServiceWorkerRegistrar />
            <PageViewTracker />
          </BookmarksProvider>
        </AuthProvider>
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
