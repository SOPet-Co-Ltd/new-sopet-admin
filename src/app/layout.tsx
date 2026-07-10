import type { Metadata } from 'next';
import { Noto_Sans_Thai, Noto_Serif_Thai } from 'next/font/google';
import Script from 'next/script';
import { AppProviders } from '@/lib/providers';
import { getThemeInitScript } from '@/lib/theme';
import './globals.css';

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-sans-thai',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const notoSerifThai = Noto_Serif_Thai({
  variable: '--font-noto-serif-thai',
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
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
    <html
      lang="th"
      className={`${notoSansThai.variable} ${notoSerifThai.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeInitScript()}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
