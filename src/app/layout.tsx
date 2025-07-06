
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/use-theme.tsx';
import { LanguageProvider, useTranslation } from '@/hooks/use-translation';
import { AuthProvider } from '@/hooks/use-auth';
import { useEffect } from 'react';

// This is a client component wrapper to handle dynamic lang attribute
function AppBody({ children }: { children: React.ReactNode }) {
  const { language } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <body className="font-body antialiased" suppressHydrationWarning={true}>
      {children}
      <Toaster />
    </body>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
            <html lang="en" suppressHydrationWarning>
            <head>
                {/* Metadata is defined in child layouts like store/layout.tsx */}
                <title>Nepali Bazaar Builder - Nexus Cart</title>
                <meta name="description" content="Your platform to build and manage your Nepali e-commerce store." />
                <link rel="manifest" href="/manifest.json" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
                <meta name="theme-color" content="#60A9CA" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Nexus Cart" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <AppBody>{children}</AppBody>
            </html>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
