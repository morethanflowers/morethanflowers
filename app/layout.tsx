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
  title: 'More Than Flowers',
  description: 'An honest apology, made with intention.',
  openGraph: {
    title: 'More Than Flowers',
    description: 'An honest apology, made with intention.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'More Than Flowers',
    description: 'An honest apology, made with intention.',
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
