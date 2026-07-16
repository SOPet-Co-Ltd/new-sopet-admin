import type { Metadata } from 'next';
import { Mitr } from 'next/font/google';
import Script from 'next/script';
import { AppProviders } from '@/lib/providers';
import { getThemeInitScript } from '@/lib/theme';
import './globals.css';

const mitr = Mitr({
  variable: '--font-mitr',
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SOPet Admin',
  description: 'พอร์ทัลผู้ดูแลและผู้ขาย SOPet',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${mitr.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeInitScript()}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
