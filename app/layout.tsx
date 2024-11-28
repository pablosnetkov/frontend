import './globals.css';
import Header from './components/header';
import type { Metadata } from 'next';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';

export const metadata: Metadata = {
  title: 'Shop App',
  description: 'Online shop application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-4">
          <NotificationProvider>
            {children}
            <NotificationContainer />
          </NotificationProvider>
        </main>
      </body>
    </html>
  );
}
