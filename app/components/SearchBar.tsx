'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from './utils/api';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface SearchResponse {
  results: Product[];
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<SearchResponse>(`/api/v1/goods/?search=${encodeURIComponent(query)}`);
      setResults(data.results.slice(0, 5)); // Показываем только первые 5 результатов
    } catch (err) {
      console.error('Ошибка поиска:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработка клика вне компонента поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    // Обработка клавиши Escape
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Debounced поиск при вводе
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Поиск товаров..."
          className="w-full px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          className="absolute inset-y-0 left-0 pl-3 flex items-center"
          aria-label="Поиск"
        >
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Выпадающий список с результатами */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Загрузка...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.price} ₽</div>
                  </div>
                </Link>
              ))}
              <div className="px-4 py-2 border-t">
                <button
                  onClick={handleSubmit}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Показать все результаты
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  );
} 