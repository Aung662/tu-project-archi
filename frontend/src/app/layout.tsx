import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Myanmar } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
import { InstallPrompt } from '@/components/InstallPrompt';

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
  title: 'မြန်မာနည်းပညာတက္ကသိုလ် စီမံကိန်းမှတ်တမ်း | TU Project Archive',
  description:
    'မြန်မာနည်းပညာတက္ကသိုလ်များအတွက် စီမံကိန်းမှတ်တမ်း — ခေါင်းစဉ်ရှာဖွေခြင်း၊ ဆင်တူခေါင်းစဉ်စစ်ဆေးခြင်းနှင့် စီမံကိန်းဟောင်းများ လှော်လှန်ကြည့်ခြင်း။ Centralized academic archive for Myanmar Technological Universities.',
  applicationName: 'TU Archive',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TU Archive',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
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
    <html lang="my" className={`${jakarta.variable} ${myanmar.variable}`}>
      <body>
        {/* Ambient animated background — sits behind everything */}
        <div className="app-aurora" aria-hidden="true">
          <span className="aurora-blob aurora-1" />
          <span className="aurora-blob aurora-2" />
          <span className="aurora-blob aurora-3" />
          <div className="aurora-grid" />
        </div>

        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <Footer />
          </div>
          <InstallPrompt />
          <ServiceWorkerRegistrar />
        </AuthProvider>
      </body>
    </html>
  );
}
