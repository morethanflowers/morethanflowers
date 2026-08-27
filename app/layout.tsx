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
  metadataBase: new URL('https://more-than-flowers.ogundejiadeola0.chatgpt.site'),
  title: 'More Than Flowers',
  description: 'An honest apology, made with intention.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'More Than Flowers',
    description: 'An honest apology, made with intention.',
    type: 'website',
    url: 'https://more-than-flowers.ogundejiadeola0.chatgpt.site',
    images: [
      {
        url: 'https://more-than-flowers.ogundejiadeola0.chatgpt.site/og.png',
        width: 1200,
        height: 630,
        alt: 'More Than Flowers — An honest apology, made with intention.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'More Than Flowers',
    description: 'An honest apology, made with intention.',
    images: ['https://more-than-flowers.ogundejiadeola0.chatgpt.site/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
