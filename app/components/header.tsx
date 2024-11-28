'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Header() {
  const { isAuthenticated, checkAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  return (
    <header className="bg-white shadow-md mb-6">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
        >
          Shop Name
        </Link>
        
        <div className="flex items-center space-x-8">
          <Link 
            href="/categories" 
            className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Каталог
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                href="/profile"
                className={`text-lg font-medium ${
                  pathname === '/profile' 
                    ? 'text-gray-900' 
                    : 'text-gray-700 hover:text-gray-900'
                } transition-colors`}
              >
                Профиль
              </Link>
              <Link 
                href="/basket"
                className={`text-lg font-medium ${
                  pathname === '/basket' 
                    ? 'text-gray-900' 
                    : 'text-gray-700 hover:text-gray-900'
                } transition-colors`}
              >
                Корзина
              </Link>
            </>
          ) : (
            <Link 
              href="/auth" 
              className={`text-lg font-medium ${
                pathname === '/auth' 
                  ? 'text-gray-900' 
                  : 'text-gray-700 hover:text-gray-900'
              } transition-colors`}
            >
              Авторизация
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}