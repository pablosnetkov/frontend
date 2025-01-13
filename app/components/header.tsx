'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useUserInfo } from '../hooks/useUserInfo';
import { useBasket } from '../contexts/BasketContext';
import SearchBar from './SearchBar';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { userInfo } = useUserInfo();
  const { itemCount } = useBasket();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-gray-800 whitespace-nowrap">
            JUBAMI
          </Link>

          <SearchBar />

          <div className="flex items-center space-x-6 whitespace-nowrap">
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              Каталог
            </Link>
            
            <Link href="/basket" className="text-gray-600 hover:text-gray-900 relative">
              Корзина
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link 
              href="/profile" 
              className="text-gray-600 hover:text-gray-900"
            >
              Профиль
            </Link>

            {isAuthenticated && userInfo?.staff && (
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-gray-900"
              >
                Панель администратора
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}