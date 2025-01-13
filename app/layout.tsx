import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './components/ClientLayout';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'JUBAMI - Интернет-магазин',
  description: 'Ваш надежный интернет-магазин',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
