'use client';

import Header from './header';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationContainer from './NotificationContainer';
import { AuthProvider } from '../contexts/AuthContext';
import { BasketProvider } from '../contexts/BasketContext';
import ScrollToTop from './ScrollToTop';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BasketProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-900 text-white py-12 mt-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">О компании</h3>
                  <p className="text-gray-400">
                    JUBAMI - ваш надежный интернет-магазин с широким ассортиментом товаров и отличным сервисом.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Контакты</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Телефон: +79821026099</li>
                    <li>Email: info@jubami.ru</li>
                    <li>Адрес: г. Екатеринбург, ул. Фонвизина, д. 8</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Информация</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Доставка и оплата
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Возврат и обмен
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Политика конфиденциальности
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>© 2025 JUBAMI</p>
              </div>
            </div>
          </footer>
          <ScrollToTop />
          <NotificationContainer />
        </BasketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
} 