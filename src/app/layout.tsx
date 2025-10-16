import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'TempDoc - Rich Text Editor with Smart Copy | WhatsApp Formatting Tool',
  description: 'Free online rich text editor with advanced copy functionality. Create formatted text that preserves bold, italic, underline when pasted into WhatsApp, Telegram, LinkedIn, and other apps. No registration required.',
  keywords: 'rich text editor, WhatsApp formatting, copy text formatting, bold text generator, italic text, online text editor, formatting tool, social media text formatter',
  authors: [{ name: 'TempDoc' }],
  creator: 'TempDoc',
  publisher: 'TempDoc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tempdoc.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TempDoc - Rich Text Editor with Smart Copy',
    description: 'Free online rich text editor with advanced copy functionality. Create formatted text that preserves formatting in WhatsApp, Telegram, and other apps.',
    url: 'https://tempdoc.app',
    siteName: 'TempDoc',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'TempDoc Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TempDoc - Rich Text Editor with Smart Copy',
    description: 'Free online rich text editor with advanced copy functionality for WhatsApp, Telegram, and social media.',
    images: ['/logo.png'],
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
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TempDoc",
              "description": "Free online rich text editor with advanced copy functionality that preserves formatting in WhatsApp, Telegram, LinkedIn, and other apps.",
              "url": "https://tempdoc.app",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Rich text editing with bold, italic, underline, strikethrough",
                "Smart copy functionality for WhatsApp formatting",
                "Unicode text formatting for social media",
                "No registration required",
                "Dark and light theme support",
                "Auto-save to localStorage"
              ],
              "screenshot": "/logo.png",
              "author": {
                "@type": "Organization",
                "name": "TempDoc"
              }
            })
          }}
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider storageKey="tempnote-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
